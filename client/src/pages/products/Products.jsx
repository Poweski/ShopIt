import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { deleteProduct, fetchFilteredProducts } from '../../api/products';
import Sidebar from "../../components/Sidebar";
import BackButton from '../../components/BackButton';
import DeleteModal from '../../components/DeleteModal'
import Popup from "../../components/Popup";

export default function Products({ searchTerm }) {
    const [products, setProducts] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupBackgroundColor, setPopupBackgroundColor] = useState('');
    const [popupHeader, setPopupHeader] = useState('');
    const [popupContent, setPopupContent] = useState('');
    const [popupShowCloseButton, setPopupShowCloseButton] = useState(false);
    const [sortOption, setSortOption] = useState("Most popular");
    const [filters, setFilters] = useState({
        selectedCategories: [],
        priceFrom: 0,
        priceTo: 999999,
    });

    const navigate = useNavigate();

    const loadFilteredProducts = async () => {
        try {
            const data = await fetchFilteredProducts({
                category: filters.selectedCategories.join(','),
                minPrice: filters.priceFrom,
                maxPrice: filters.priceTo,
                sortOption,
                search: searchTerm
            });
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch filtered products:", err);
        }
    };

    useEffect(() => {
        loadFilteredProducts();
    }, [filters, sortOption, searchTerm]);

    const handleSortChange = (newSortOption) => {
        setSortOption(newSortOption);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        const popupData = sessionStorage.getItem("popupData");
        
        if (popupData) {
            const parsed = JSON.parse(popupData);
            setPopupBackgroundColor(parsed.backgroundColor);
            setPopupHeader(parsed.header);
            setPopupContent(parsed.content);
            setPopupShowCloseButton(parsed.showCloseButton);
            setIsPopupOpen(true);
        
            sessionStorage.removeItem("popupData");
        }
    }, []);
        
    const closePopup = () => {
        setIsPopupOpen(false);
    };

    const handleAddProduct = () => {
        navigate(`/addproduct`);
    };

    const handleViewProduct = (id) => {
        navigate(`/viewproduct/${id}`);
    };

    const handleEditProduct = (id) => {
        navigate(`/editproduct/${id}`);
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
      };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
            setPopupBackgroundColor("#008236");
            setPopupHeader("Success!");
            setPopupContent("Product has been successfully deleted!");
            setPopupShowCloseButton(false);
            setIsPopupOpen(true);
            } catch (err) {
            setPopupBackgroundColor("red");
            setPopupHeader(`Failed to delete product.`);
            setPopupContent(`${err}`);
            setPopupShowCloseButton(true);
            setIsPopupOpen(true);
            console.error('Failed to delete product:', err);
        }
    };

    return (
        <main className="flex flex-grow pt-18">
            <div className="flex flex-grow pb-4">
                <Sidebar onSortChange={handleSortChange} onFilterChange={handleFilterChange} />
                <div className="flex-grow p-4 container mx-auto mt-12 flex flex-col items-center">
                    <div className="text-center mt-4">
                        <div className="inline-block bg-green-700 text-white text-2xl font-bold px-6 py-3 rounded-md shadow-md">
                            Products Management
                        </div>
                    </div>
                    <div className="mb-4 mt-8">
                        <button
                            className="ml-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            onClick={() => handleAddProduct()}
                        >
                            Add new product
                        </button>
                    </div>
                    <ul className="mt-8 w-full max-w-3xl">
                        {products.length === 0 ? (
                            <div className="flex-grow p-6 w-full py-10">
                                <div className="col-span-full flex text-center items-center justify-center text-white bg-neutral-800 text-xl font-medium py-20 rounded-md">
                                    No products matching given criteria.
                                </div>
                            </div>
                        ) : (
                            products.map((product) => (
                                <li key={product._id} className="flex justify-between items-center mb-4 w-full p-2 bg-white border rounded">
                                    <div className="flex flex-col w-2/5">
                                        <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</span>
                                        <span>{product.category?.name}</span>
                                    </div>
                                    <div className="flex flex-col w-1/5">
                                        <span className="font-semibold">Price: ${parseFloat(product.price).toFixed(2)}</span>
                                        <span>Stock: {product.stock}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-4 w-20 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                            onClick={() => handleViewProduct(product._id)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="px-4 w-20 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                            onClick={() => handleEditProduct(product._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-4 w-20 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                            onClick={() => handleDeleteProduct(product)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                    <BackButton onClick={() => { navigate(-1); }} />
                </div>
            </div>    
            <DeleteModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            onDelete={handleDelete} 
            item={productToDelete}
            titleItem="product"
            itemLabel={productToDelete?.name}
            />
            <Popup
            isOpen={isPopupOpen}
            onClose={closePopup}
            backgroundColor={popupBackgroundColor}
            header={popupHeader}
            content={popupContent}
            showCloseButton={popupShowCloseButton}
            autoCloseTime={3000}
            />
        </main>    
    );
}
  