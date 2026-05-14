import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, ArrowLeft, RefreshCw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StockCard from '../../../components/StockCard';

const ViewStock = () => {
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
      const res = await axios.get('http://localhost:5001/api/products/getProducts', config);
      setProducts(res.data.products || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };


  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const cName = product.category?.category_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || cName.includes(search);
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="flex items-center gap-3 text-textMain/50 transition-colors duration-300 font-medium">
          <Loader2 className="animate-spin text-primary transition-all duration-300" size={24} /> Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300 animate-in fade-in duration-500">

      <div className=" px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b-4 border-primary transition-all duration-300">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary transition-all duration-300 rounded-2xl text-textMain transition-colors duration-300">
            <Package size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-0.5">
              Inventory Management
            </p>
            <h1 className="text-2xl font-black text-textMain transition-colors duration-300 uppercase tracking-tight">View Stock Levels</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-3 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-xl text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 hover:shadow-md transition-all active:scale-90"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textMain/50 transition-colors duration-300 hover:text-white transition-colors font-bold text-sm px-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2.5rem] shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <Search size={20} className="text-textMain/50 transition-colors duration-300" />
            <input 
              type="text"
              placeholder="Search by product name or category..."
              className="flex-1 bg-transparent outline-none text-textMain transition-colors duration-300 font-semibold text-sm placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <StockCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-dashed border-border transition-colors duration-300 py-24 text-center">
            <Package className="mx-auto text-textMain/50 transition-colors duration-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-textMain/50 transition-colors duration-300">No Products Found</h3>
            <p className="text-sm text-textMain/50 transition-colors duration-300 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStock;