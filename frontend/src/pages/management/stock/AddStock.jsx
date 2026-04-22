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

}
export default AddStock;