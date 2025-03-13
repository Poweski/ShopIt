const products = [
    { id: 1, name: "ASUS Laptop", price: "2999 zł", image:"https://picsum.photos/300/200" },
    { id: 2, name: "Smartwatch", price: "599 zł", image:"https://picsum.photos/300/200" },
    { id: 3, name: "Wireless headphones", price: "199 zł", image:"https://picsum.photos/300/200" },
    { id: 4, name: "Smartwatch", price: "599 zł", image:"https://picsum.photos/300/200" },
    { id: 5, name: "Wireless headphones", price: "199 zł", image:"https://picsum.photos/300/200" },
    { id: 6, name: "ASUS Laptop", price: "2999 zł", image:"https://picsum.photos/300/200" },
    { id: 7, name: "Smartwatch", price: "599 zł", image:"https://picsum.photos/300/200" },
    { id: 8, name: "Wireless headphones", price: "199 zł", image:"https://picsum.photos/300/200" },
    { id: 9, name: "Smartwatch", price: "599 zł", image:"https://picsum.photos/300/200" }
  ];
  
  const ProductList = () => {
    return (
      <div className="container mx-auto py-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Most popular products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 shadow-lg rounded-lg text-center">
              <img src={product.image} alt={product.name} className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-700 ">{product.price}</p>
              <button className="mt-4 mr-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">View product</button>
              <button className="mt-4 mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add to cart</button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ProductList;
  