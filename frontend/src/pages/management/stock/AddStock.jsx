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

}
export default AddStock;