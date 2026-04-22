import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Package, AlertCircle, CheckCircle, 
  Loader2, ChevronDown, ArrowLeft, RefreshCw, Edit2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AddStock = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStockData, setNewStockData] = useState({
    variant_id: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5001/api/products/getProducts', config);
      setProducts(res.data.products || res.data);
    } catch (err) {
      if(err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStockData.variant_id || !newStockData.quantity) {
      toast.error("Please select variant and enter quantity");
      return;
    }
 
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5001/api/stock/addStock', newStockData, config);
      
      toast.success("Stock added successfully!");
      setShowAddModal(false);
      setNewStockData({ variant_id: '', quantity: '', notes: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add stock");
    }
  };

  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const pCode = product.product_code?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || pCode.includes(search);
  });
 
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Loader2 className="animate-spin text-[#b4a460]" size={48} />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-6">Loading Inventory</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      <Toaster position="top-right" />
 
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-black flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-black rounded-2xl text-[#b4a460] shadow-xl">
              <Package size={24} />
            </div>
            Stock Management
          </h2>
          <p className="text-gray-400 text-sm mt-2 ml-14 font-medium">Add and manage product stock levels across variants.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:shadow-md transition-all active:scale-90"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm px-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>
 
      {/* Search Bar */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-300" />
          <input 
            type="text"
            placeholder="Search by product name or code..."
            className="flex-1 bg-transparent outline-none text-black font-semibold text-sm placeholder-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-black text-[#b4a460] px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-[#b4a460]/30 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>
    </div>



  );
 
}
export default AddStock;