import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, editProduct } from "../../api/products";
import { fetchCategories } from "../../api/categories";
import BackButton from '../../components/BackButton';
import UnsavedChangesModal from '../../components/UnsavedChangesModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [images, setImages] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState("http://localhost:3000/images/No_Image_Available.jpg");
  const [initialData, setInitialData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  
  const isModified =
    name !== initialData.name ||
    description !== initialData.description ||
    price !== initialData.price ||
    stock !== initialData.stock ||
    category !== initialData.category ||
    (images[0]?.url !== initialData.imageUrl && !images[0]?.file);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await getProduct(id);
  
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setCategory(product.category._id);
  
        const imageUrls = product.imageUrls || [];
        const fullImageUrls = imageUrls.map(url => `http://localhost:3000${url}`);
  
        const imageObjects = fullImageUrls.map(url => ({ url, isDeleted: false }));
        setImages(imageObjects);
  
        setSelectedImageUrl(fullImageUrls.length > 0 ? fullImageUrls[0] : "http://localhost:3000/images/No_Image_Available.jpg");
  
        setInitialData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category._id,
          imageUrls: fullImageUrls,
        });
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };
  
    loadProduct();
  }, [id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!description) newErrors.description = "Description is required";
    if (!price) newErrors.price = "Price is required";
    if (!stock) newErrors.stock = "Stock is required";
    if (!category) newErrors.category = "Category is required";
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", parseInt(stock));
    formData.append("category", category);
  
    const deletedImages = [];
  
    images.forEach((imgObj) => {
      if (imgObj.isDeleted) {
        deletedImages.push(imgObj.url);
      } else if (imgObj.file) {
        formData.append("images", imgObj.file);
      }
    });
  
    try {
      await editProduct(id, formData, deletedImages);
      sessionStorage.setItem("popupData", JSON.stringify({
        backgroundColor: "#008236",
        header: "Success!",
        content: "Product has been successfully saved!",
        showCloseButton: false
      }));
      setUnsavedChanges(false);
    } catch (error) {
      sessionStorage.setItem("popupData", JSON.stringify({
        backgroundColor: "red",
        header: "Failed to save product.",
        content: `${error}`,
        showCloseButton: true
      }));
      console.error(error);
    } finally {
      navigate(-1);
    }
  };

  const handleLeave = () => {
    setIsModalOpen(false);
    setUnsavedChanges(false);
    navigate(-1);
  };
  
  const handleStay = () => {
    setIsModalOpen(false);
  };

  const handleDeleteSelectedImage = () => {
    setImages((prev) =>
      prev.map((img) =>
        img.previewUrl === selectedImageUrl || img.url === selectedImageUrl
          ? { ...img, isDeleted: true }
          : img
      )
    );
  
    setSelectedImageUrl("http://localhost:3000/images/No_Image_Available.jpg");
    setUnsavedChanges(true);
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const previewUrl = URL.createObjectURL(file);
  
    const newImage = { file, previewUrl, isDeleted: false };
    setImages((prev) => [...prev, newImage]);
  
    setSelectedImageUrl(previewUrl);
    setUnsavedChanges(true);
  };

  return (
    <main className="flex flex-col flex-grow">
      <div className="text-center pt-10 mt-26">
        <div className="inline-block bg-green-700 text-white text-2xl font-bold px-6 py-3 rounded-md shadow-md">
          Edit Product
        </div>
      </div>

      <div className="flex flex-col items-center mt-10"> 
        <form onSubmit={handleSubmit}>
        <div className="bg-neutral-800 p-6 rounded-md shadow-md mx-6 w-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-md border-0 flex flex-col items-center justify-center">
              <label htmlFor="file-input" className="text-white font-lg font-bold pb-2">Image</label>
              <div className="mb-4 relative w-full max-w-md mx-auto">
                <img
                  src={selectedImageUrl}
                  alt="Selected Preview"
                  className="h-64 w-full object-contain rounded-md"
                />

                {images.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedImage}
                  className="absolute bottom-2 right-2 w-10 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition"
                  title="Delete image"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                </button>)}
              </div>

                <div className="flex justify-center gap-2 mb-4">
                  {images.map((imgObj, index) => (
                    <div
                      key={index}
                      className={`relative w-16 h-16 border-4 rounded overflow-hidden bg-white cursor-pointer transition 
                        ${selectedImageUrl === imgObj.url ? 'border-blue-600' : 'border-gray-300'}
                        hover:shadow-md hover:ring-2 hover:ring-blue-600`}
                    >
                      <img
                        src={imgObj.url}
                        alt={`Thumb ${index}`}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedImageUrl(imgObj.url)}
                      />
                    </div>
                  ))}

                  {images.length < 5 && (
                    <div className="relative w-16 h-16 border-2 border-gray-400 rounded flex items-center justify-center overflow-hidden bg-white hover:shadow-md hover:ring-2 hover:ring-blue-600">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleAddImage(e);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-2xl text-gray-500 font-bold pointer-events-none">+</span>
                    </div>
                  )}
                </div>
              </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="productName" className="text-white font-lg font-bold pb-2">Name</label>
                <input
                  id="productName"
                  type="text"
                  maxLength={50}
                  className={`w-full border text-black ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors({ ...errors, name: "" });
                    setUnsavedChanges(true);
                  }}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="flex flex-col">
                <label htmlFor="productPrice" className="text-white font-lg font-bold pb-2">Price ($)</label>
                <input
                  id="productPrice"
                  type="number"
                  max={999999}
                  className={`w-full border text-black ${errors.price ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black`}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors({ ...errors, price: "" });
                    setUnsavedChanges(true);
                  }}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              <div className="flex flex-col">
                <label htmlFor="productStock" className="text-white font-lg font-bold pb-2">Stock</label>
                <input
                  id="productStock"
                  type="number"
                  max={999999}
                  className={`w-full border text-black ${errors.stock ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black`}
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    setErrors({ ...errors, stock: "" });
                    setUnsavedChanges(true);
                  }}
                />
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
              </div>

              <div className="flex flex-col">
                <label htmlFor="productCategory" className="text-white font-lg font-bold pb-2">Category</label>
                <select
                  id="productCategory"
                  className={`w-full border text-black ${errors.category ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors({ ...errors, category: "" });
                    setUnsavedChanges(true);
                  }}
                >
                <option value="">-- Select --</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="productDescription" className="block text-white font-lg font-bold pb-2">
              Description
            </label>
            <textarea
              id="productDescription"
              maxLength={400}
              className={`w-full border text-black ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black`}
              rows="4"
              placeholder="Enter product description..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
                setUnsavedChanges(true);
              }}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
        </div>
             
           <div className="flex text-center gap-8 items-center justify-center my-4">
           <BackButton onClick={() => {
              if (unsavedChanges) {
                setIsModalOpen(true);
              } else {
                navigate(-1);
              }
            }} />
            <button
              disabled={!isModified}
              type="submit"
              className={`p-2 rounded w-40 text-white transition-colors duration-200 ${
                isModified
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500"
              }`}
              >
              Save
            </button>
          </div>
        </form>
      </div>
      <UnsavedChangesModal 
        isOpen={isModalOpen} 
        onClose={handleStay} 
        onExit={handleLeave} 
      />
    </main>
  );
}
