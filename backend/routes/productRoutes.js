require("mongoose");
require('../models/Category');

const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('A file that is not an image was uploaded'), false);
  }
};

const upload = multer({ storage, fileFilter });

const processImage = async (filePath) => {
  const outputFilePath = filePath.replace(/\.\w+$/, '-resized.jpg');
  await sharp(filePath)
    .resize({
      width: 600,
      height: 400,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(outputFilePath);

  fs.unlinkSync(filePath);
  return outputFilePath.replace(/\\/g, '/').replace('uploads/', '/uploads/');
};

router.get('/filter', async (req, res) => {
  const { min, max, categories, sort, search } = req.query;

  let query = {};

  if (search && search.trim() !== '') {
    try {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    } catch (err) {
      console.error('Error creating search regex:', err);
      return res.status(400).send({ message: 'Invalid search query format' });
    }
  }

  if (min || max) {
    query.price = {};
    if (min) {
      if (isNaN(Number(min))) {
        return res.status(400).send({ message: 'Invalid minimum price value' });
      }
      query.price.$gte = Number(min);
    }
    if (max) {
      if (isNaN(Number(max))) {
        return res.status(400).send({ message: 'Invalid maximum price value' });
      }
      query.price.$lte = Number(max);
    }
  }

  if (categories && categories.trim() !== '') {
    const categoryNames = categories.split(',').map(name => name.trim());

    try {
      const foundCategories = await Category.find({ name: { $in: categoryNames } });

      if (foundCategories.length === 0) {
        return res.status(404).send({ message: 'No matching categories found' });
      }

      const categoryIds = foundCategories.map(cat => cat._id);
      query.category = { $in: categoryIds };
    } catch (err) {
      console.error("Error resolving category names:", err);
      return res.status(500).send({ message: 'Internal server error while fetching categories' });
    }
  }

  let sortOption = {};
  if (sort === 'desc') {
    sortOption.price = -1;
  } else if (sort === 'asc') {
    sortOption.price = 1;
  } else if (sort && sort !== 'desc' && sort !== 'asc') {
    return res.status(400).send({ message: 'Invalid sort option. Use "asc" or "desc".' });
  }

  try {
    const products = await Product.find(query)
      .populate('category')
      .sort(sortOption);

    const updatedProducts = products.map(product => {
      const productObj = product.toObject();
    
      if (!productObj.imageUrls || productObj.imageUrls.length === 0) {
        productObj.imageUrls = ["/images/No_Image_Available.jpg"];
      }
    
      return productObj;
    });
        
    res.json(updatedProducts);
  } catch (err) {
    console.error("Error fetching filtered products:", err);
    res.status(500).send({ message: 'Internal server error while fetching products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productObj = product.toObject();

    if (!productObj.imageUrls || productObj.imageUrls.length === 0) {
      productObj.imageUrls = ["/images/No_Image_Available.jpg"];
    }

    res.json(productObj);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({
      message: "Error fetching product",
      error: err.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();

    if (!productObj.imageUrls || productObj.imageUrls.length === 0) {
      productObj.imageUrls = ["/images/No_Image_Available.jpg"];
    }

    res.json(productObj);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: 'Server error while fetching product', error: err.message });
  }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = [];

    if (req.files) {
      for (let file of req.files) {
        const imageUrl = await processImage(file.path);
        imageUrls.push(imageUrl);
      }
    }

    const { name, description, price, stock, category } = req.body;
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "Missing required fields: name, description, price, stock, or category" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
      imageUrls
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
});

router.put('/:id', upload.array('images', 5), async (req, res) => {
  const { name, description, price, stock, category, deletedImages } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.warn('Product not found for id:', req.params.id);
      return res.status(404).json({ message: `Product with id ${req.params.id} not found` });
    }

    let newImageUrls = [...product.imageUrls];

    if (deletedImages && deletedImages.length > 0) {
      for (let imageUrl of deletedImages) {
        const oldImagePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          newImageUrls = newImageUrls.filter(url => url !== imageUrl);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const imageUrl = await processImage(file.path);
        newImageUrls.push(imageUrl);
      }
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.imageUrls = newImageUrls;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large' });
    }
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.warn(`Product with ID ${req.params.id} not found`);
      return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });
    }

    if (product.imageUrls && product.imageUrls.length > 0) {
      for (let imageUrl of product.imageUrls) {
        const imagePath = path.join(__dirname, '..', imageUrl);

        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error(`Error deleting image file at ${imagePath}:`, err.message);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("Error while deleting product:", err);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;
