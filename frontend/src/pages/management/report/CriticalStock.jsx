// 📄 src/pages/management/report/CriticalStock.jsx

import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Search, Loader2, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StockCard from '../../../components/StockCard';

const CriticalStock = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [token, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get('/products/getProducts', config);
      
      const allProducts = res.data.products || res.data || [];
      
      // 🎯 SUPER FILTER LOGIC: Critical හෝ Out of Stock සීමාවේ තියෙන Variants පමණක් වෙන්කර ගැනීම
      const criticalOnly = allProducts.reduce((acc, product) => {
        const variants = product.variants || [];
        const criticalVariants = variants.filter(v => {
          const stock = Number(v.stock_count || 0);
          const criticalLevel = Number(v.critical_stock_level ?? 5); // Default 5 manually handle වෙනවා
          return stock <= criticalLevel;
        });

        if (criticalVariants.length > 0) {
          // Critical variants පමණක් ඇතුළත් කර අලුත් object එකක් සාදයි
          acc.push({ ...product, variants: criticalVariants });
        }
        return acc;
      }, []);

      setProducts(criticalOnly);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Failed to load critical inventory logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search Box Filtering
  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const cName = product.category?.category_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || cName.includes(search);
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="flex items-center gap-[0.75rem] text-textMain/50 transition-colors duration-300 font-medium">
          <Loader2 className="animate-spin text-primary transition-all duration-300" size={24} /> 
          <span className="text-xs font-black uppercase tracking-widest">Auditing Stock Level Shortages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300 animate-in fade-in duration-500">

      {/* Header Layer (Styled like ViewStock but with Danger Alerts Red/Gold) */}
      <div className="px-[2rem] py-[1.75rem] flex flex-col md:flex-row items-center justify-between gap-[1.25rem] border-b-4 border-red-500 transition-all duration-300">
        <div className="flex items-center gap-[1.25rem] text-left">
          <div className="p-[0.75rem] bg-red-500/10 text-red-500 rounded-2xl animate-pulse">
            <AlertTriangle size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[0.625rem] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-[0.125rem]">
              Stock Shortage Watchlist
            </p>
            <h1 className="text-[1.5rem] font-serif font-black text-textMain transition-colors duration-300 uppercase tracking-tight">
              Critical Stock Shortages
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-[1rem]">
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-[0.75rem] bg-card border border-border rounded-xl text-textMain/50 hover:text-textMain hover:shadow-sm transition-all active:scale-90 cursor-pointer"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-[0.5rem] text-textMain/50 hover:text-textMain font-bold text-[0.875rem] px-[0.5rem] cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      <div className="p-[1.5rem] md:p-[2rem]">
        
        {/* Total Shortage Count Banner */}
        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-left flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md">
            {products.length} Items At Risk
          </span>
          <p className="text-[11px] font-medium text-textMain/60">
            These inventory products require immediate re-order actions to retain normal distribution supply loops.
          </p>
        </div>

        {/* Search Bar Input Layout */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm p-[1.5rem] mb-[2rem]">
          <div className="flex items-center gap-[1rem]">
            <Search size={20} className="text-textMain/50" />
            <input 
              type="text"
              placeholder="Filter critical items by name or category..."
              className="flex-1 bg-transparent outline-none text-textMain font-semibold text-[0.875rem] placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stock Cards Grid Layer (Re-uses StockCard beautifully) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1.5rem]">
            {filteredProducts.map((product) => (
              <StockCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-[1.5rem] border border-dashed border-border py-[6rem] text-center">
            <AlertTriangle className="mx-auto text-emerald-500 mb-4 animate-bounce" size={48} />
            <h3 className="text-[1.125rem] font-bold text-textMain/60 uppercase tracking-wide">Stock Levels Secured</h3>
            <p className="text-sm text-textMain/40 font-medium mt-2">No product variants are currently running below their critical registry levels.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriticalStock;