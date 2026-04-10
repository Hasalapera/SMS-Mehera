import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Package, Tag, Layers, RefreshCw, 
  ArrowLeft, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../../components/ProductCard'; 



const ViewProduct = () => {
    const { token, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    if(!token) {
        navigate('/');
        return;
    }

    const initializeData = async () => {
        setLoading(true);
        await Promise.all([fetchInitialData(), fetchProducts()]);
        setLoading(false);
    }
    initializeData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [catRes, brandRes] = await Promise.all([
            axios.get('http://localhost:5001/api/category/getCategories', config),
            axios.get('http://localhost:5001/api/brands/getBrands', config)
        ]);
        setCategories(catRes.data.categories || catRes.data);
        setBrands(brandRes.data.brands || brandRes.data);
    } catch (err){
        if (err.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            logout();
        }
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/products/getProducts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(res.data.products || res.data);
    } catch (err){
        console.error("Error fetching products:", err);
        toast.error("Failed to load products");
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    return pName.includes(searchTerm.toLowerCase()) &&
        (selectedCategory === '' || product.category_id === selectedCategory) &&
        (selectedBrand === '' || product.brand_id === selectedBrand);
  }) : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-black flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-black rounded-2xl text-[#b4a460] shadow-xl">
              <Package size={24} />
            </div>
            Product Inventory
          </h2>
          <p className="text-gray-400 text-sm mt-2 ml-14 font-medium">Explore and manage Mehera International's curated collection.</p>
        </div>
        <div className="flex gap-3 ml-14 md:ml-0">
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:shadow-md transition-all active:scale-90"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm px-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      {/* --- Filters Section --- */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 mb-12 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* Search */}
          <div className="space-y-3 text-left">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              <Search size={14} className="text-[#b4a460]" /> Product Name
            </label>
            <input 
              type="text"
              placeholder="Search items..."
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-3 text-left">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              <Layers size={14} className="text-[#b4a460]" /> Category
            </label>
            <select 
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold text-sm cursor-pointer appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="space-y-3 text-left">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              <Tag size={14} className="text-[#b4a460]" /> Brand
            </label>
            <select 
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold text-sm cursor-pointer appearance-none"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="mt-6 flex justify-end">
            <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory(''); setSelectedBrand('');}}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#b4a460] transition-colors"
            >
                Reset Filters
            </button>
        </div>
      </div>

      {/* --- 📦 Product Grid --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-[#b4a460]" size={48} />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Updating Catalog</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map(product => (
           
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-[3rem] py-24 text-center mt-6">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-gray-200" size={48} />
          </div>
          <h3 className="text-2xl font-black text-black">Catalog Empty</h3>
          <p className="text-gray-400 text-sm mt-2 font-medium">Try refining your filters or search terms.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory(''); setSelectedBrand('');}}
            className="mt-8 bg-black text-[#b4a460] px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-[#b4a460]/30 transition-all"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;