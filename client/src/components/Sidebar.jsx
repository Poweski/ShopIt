import { ChevronLast, ChevronFirst } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchCategories } from '../api/categories';

export default function Sidebar({ onSortChange, onFilterChange }) {
  const [expanded, setExpanded] = useState(false);
  const options = ["Most popular", "Descending price", "Rising price"];
  const [selected, setSelected] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [priceErrors, setPriceErrors] = useState({
    from: '',
    to: '',
  });

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data); 
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    getCategories();
  }, []);

  const handleSortChange = (option) => {
    onSortChange(option);
  };

  const handlePriceChange = (type, value) => {
    const num = Number(value);
  
    if (!value) {
      if (type === 'from') setPriceFrom(undefined);
      else setPriceTo(undefined);
  
      setPriceErrors((prev) => ({
        ...prev,
        [type]: '',
      }));
      return;
    }
  
    if (type === 'from') setPriceFrom(num);
    else setPriceTo(num);
  };

  const validatePrices = () => {
    let error = false;
  
    const newErrors = { from: '', to: '' };
  
    if (priceFrom && (priceFrom < 0 || priceFrom > 999999)) {
      newErrors.from = 'The value must be between 1 and 999,999';
      error = true;
    }
  
    if (priceTo && (priceTo < 0 || priceTo > 999999)) {
      newErrors.to = 'The value must be between 1 and 999,999';
      error = true;
    }
  
    if (priceFrom !== undefined && priceTo !== undefined && priceFrom > priceTo) {
      newErrors.from = "'From' cannot be greater than 'To'";
      error = true;
    }
  
    setPriceErrors(newErrors);
  
    return error;
  };

  const applyFilters = () => {
    if (!validatePrices()) {
      onFilterChange({ selectedCategories, priceFrom, priceTo });
    }
  };

  const clearFilters = () => {
    const clearedSort = options[0];
    const clearedCategories = [];
    const clearedPriceFrom = undefined;
    const clearedPriceTo = undefined;
  
    setSelected(clearedSort);
    setPriceFrom(clearedPriceFrom);
    setPriceTo(clearedPriceTo);
    setSelectedCategories(clearedCategories);
  
    onSortChange(clearedSort);
    onFilterChange({
      selectedCategories: clearedCategories,
      priceFrom: clearedPriceFrom,
      priceTo: clearedPriceTo
    });
  };
  

  return (
    <aside>
      <nav className={`h-full pt-6 flex flex-col items-center border-0 transition-all duration-300 overflow-hidden ${expanded ? 'bg-neutral-800' : 'bg-neutral-900'}`}>
        
        <div className="p-4 pb-2 flex">
          <p className={`overflow-hidden transition-all text-xl font-bold text-center text-white ${expanded ? "w-64" : "w-0" }`}>SORTING</p>
          <button 
            onClick={() => setExpanded((curr) => !curr)} 
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <div className={`p-4 pb-2 flex justify-between items-center transition-all duration-300 ${expanded ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          {expanded && (
            <div className={`ml-2 ${expanded ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                  w-full px-4 py-2 bg-white text-black rounded-md flex justify-between items-center 
                  focus:outline-none focus:ring-3 focus:ring-black
                  transition-all duration-300 ease-in-out ${expanded ? "w-64 opacity-100 visible" : "w-0 opacity-0 invisible"}
                `}
              >
                {selected}
                <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
              </button>

              <ul
                className={`
                  flex flex-col bg-white rounded overflow-hidden border mt-1 transition-all duration-300 ease-in-out
                  ${isOpen ? "max-h-[500px] py-2 opacity-100" : "max-h-0 py-0 opacity-0"} 
                `}
              >
                {options.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelected(option); 
                      setIsOpen(false);
                      handleSortChange(option);                 
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all duration-300"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className={`text-xl font-bold text-center text-white ${expanded ? "w-68 opacity-100" : "w-0 opacity-0 overflow-hidden" } ${isOpen ? "mt-2" : "mt-0"}`}>FILTERING</p>
        </div>

        <div className={`p-4 pb-2 flex justify-center items-center transition-all duration-300 ${expanded ? "w-68 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          {expanded && (
            <div className="text-center w-64">
              <h2 className="font-bold text-white">Price:</h2>
              <div className="flex justify-center gap-4 mt-2">
                <input
                  id="priceFrom"
                  type="number"
                  min="0"
                  max="999999"
                  placeholder="From"
                  className={`w-full px-4 py-2 bg-white text-black rounded-md flex justify-between items-center focus:outline-none focus:ring-3 focus:ring-black
                    transition-all duration-300 ${expanded ? "w-68 opacity-100" : "w-0 opacity-0 overflow-hidden"} ${
                      priceErrors.from ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={(e) => handlePriceChange('from', e.target.value)} 
                  value={priceFrom || ''}
                />
                <input
                  id="priceTo"
                  type="number"
                  min="0"
                  max="999999"
                  placeholder="To"
                  className={`w-full px-4 py-2 bg-white text-black rounded-md flex justify-between items-center focus:outline-none focus:ring-3 focus:ring-black
                    transition-all duration-300 ${expanded ? "w-68 opacity-100" : "w-0 opacity-0 overflow-hidden"} ${
                      priceErrors.to ? 'border-red-500' : 'border-gray-300'
                    }`}
                    
                  onChange={(e) => handlePriceChange('to', e.target.value)} 
                  value={priceTo || ''}
                />
              </div>
              <div className="flex justify-center gap-4 mt-2">             
                {priceErrors.from && (
                  <p className="text-red-500 text-sm mt-1">{priceErrors.from}</p>
                )}                
                {priceErrors.to && (
                  <p className="text-red-500 text-sm mt-1">{priceErrors.to}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 pb-2 flex transition-all duration-300 ${expanded ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          {expanded && (
            <div className="text-center w-64">
              <h2 className="font-bold text-white">Categories:</h2>
              <ul className={`space-y-2 mt-2`}>
                {categories.map((category) => (
                  <li 
                    key={category._id} 
                    className="flex justify-between items-center p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => toggleCategory(category.name)}
                  >
                    <span className="text-white font-semibold">{category.name}</span>
                    <input
                      id={category.name}
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      className="cursor-pointer"
                      onChange={(e) => e.stopPropagation()}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={`flex flex-col items-center justify-center p-4 pb-2 transition-all duration-300 ${expanded ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
        {expanded && (
          <button
            onClick={applyFilters}
            className={`mb-4 flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded`}
          >
            Apply filters
          </button>
        )}
        {expanded && (
          <button
            onClick={clearFilters}
            className={`flex bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded`}
          >
            Clear all
          </button>
        )}
        </div>
      </nav>
    </aside>
  )
}
