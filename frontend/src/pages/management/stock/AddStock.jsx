import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Package, AlertCircle, 
  Loader2, ChevronDown, ArrowLeft, RefreshCw
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

  // Inline stock input state: { variant_id: quantity }
  const [inlineQuantity, setInlineQuantity] = useState({});
  
  // Bulk distribution state
  const [bulkQuantity, setBulkQuantity] = useState('');
  const [selectedProductForBulk, setSelectedProductForBulk] = useState(null);

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

  // Handle inline quantity input
  const handleQuantityChange = (variantId, value) => {
    setInlineQuantity({
      ...inlineQuantity,
      [variantId]: value
    });
  };

  // Add stock for single variant (inline)
  const handleAddStock = async (variantId) => {
    const quantity = inlineQuantity[variantId];

    if (!quantity || quantity === '') {
      toast.error("Please enter a quantity");
      return;
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      toast.error("Quantity must be a positive whole number");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `http://localhost:5001/api/products/variants/${variantId}/add-stock`,
        { quantity: parsedQty },
        config
      );
      
      toast.success("Stock added successfully!");
      
      // Clear input & refresh
      setInlineQuantity({ ...inlineQuantity, [variantId]: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add stock");
    }
  };

  // Bulk add stock to all variants of a product
  const handleBulkAddStock = async (productId) => {
    if (!bulkQuantity || bulkQuantity === '') {
      toast.error("Please enter a quantity");
      return;
    }

    const parsedQty = Number(bulkQuantity);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      toast.error("Quantity must be a positive whole number");
      return;
    }

    const product = products.find(p => p.product_id === productId);
    if (!product || !product.variants || product.variants.length === 0) {
      toast.error("No variants found for this product");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let successCount = 0;

      // Add stock to each variant
      for (const variant of product.variants) {
        try {
          await axios.patch(
            `http://localhost:5001/api/products/variants/${variant.variant_id}/add-stock`,
            { quantity: parsedQty },
            config
          );
          successCount++;
        } catch (err) {
          console.error(`Failed to add stock to variant ${variant.variant_id}`);
        }
      }

      toast.success(`Stock added to ${successCount} variants!`);
      
      // Clear inputs & refresh
      setBulkQuantity('');
      setSelectedProductForBulk(null);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to add bulk stock");
    }
  };

  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search);
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
            placeholder="Search by product name..."
            className="flex-1 bg-transparent outline-none text-black font-semibold text-sm placeholder-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map(product => (
          <div key={product.product_id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* Product Header - Clickable to Expand */}
            <button
              onClick={() => setExpandedProduct(expandedProduct === product.product_id ? null : product.product_id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
            >
              <div className="flex-1">
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">
                  {product.product_name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b4a460]"></span>
                    Category: {product.category?.category_name || 'N/A'}
                  </span>
                  <span className="ml-auto text-[#b4a460] font-black">
                    {product.variants?.length || 0} Variants
                  </span>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-300 transition-transform ${expandedProduct === product.product_id ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded Variants - Table Style */}
            {expandedProduct === product.product_id && (
              <div className="bg-gray-50/50 border-t border-gray-100 divide-y divide-gray-100">
                {product.variants && product.variants.length > 0 ? (
                  <>
                    {/* Table Header */}
                    <div className="p-6 bg-gray-100/50 grid grid-cols-1 md:grid-cols-5 gap-6 font-black text-[10px] uppercase tracking-widest text-gray-400">
                      <div className="md:col-span-2">Variant</div>
                      <div>Current Stock</div>
                      <div>Price</div>
                      <div>Action</div>
                    </div>

                    {/* Table Rows */}
                    {product.variants.map((variant) => (
                      <div key={variant.variant_id} className="p-6 hover:bg-gray-100/50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                          
                          {/* Variant Info */}
                          <div className="md:col-span-2">
                            <p className="text-black font-bold">{variant.variant_name || `Variant ${variant.variant_id}`}</p>
                            {variant.size && <p className="text-sm text-gray-400">Size: {variant.size}</p>}
                            {variant.color && <p className="text-sm text-gray-400">Color: {variant.color}</p>}
                          </div>

                          {/* Current Stock */}
                          <div>
                            <span className={`text-2xl font-black ${
                              variant.stock_count > 20 ? 'text-green-600' : 
                              variant.stock_count > 0 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {variant.stock_count || 0}
                            </span>
                            <p className="text-gray-400 text-xs font-semibold">Units</p>
                            {variant.stock_count === 0 && (
                              <div className="flex items-center gap-1.5 mt-2 text-red-600 text-[10px] font-bold">
                                <AlertCircle size={12} />
                                OUT OF STOCK
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div>
                            <p className="text-lg font-black text-black">
                              {Number(variant.price || 0).toLocaleString()} LKR
                            </p>
                          </div>

                          {/* Inline Add Stock */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={inlineQuantity[variant.variant_id] || ''}
                              onChange={(e) => handleQuantityChange(variant.variant_id, e.target.value)}
                              className="w-16 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-[#b4a460] focus:ring-2 focus:ring-[#b4a460]/20"
                              min="1"
                            />
                            <button
                              onClick={() => handleAddStock(variant.variant_id)}
                              className="p-3 bg-black text-[#b4a460] rounded-xl hover:shadow-lg hover:shadow-[#b4a460]/30 transition-all active:scale-95 font-bold"
                              title="Add stock"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Bulk Add Stock Section */}
                    <div className="p-6 bg-white border-t-2 border-[#b4a460]/20">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                            Add Same Quantity to All Variants
                          </label>
                          <input
                            type="number"
                            placeholder="Enter quantity..."
                            value={selectedProductForBulk === product.product_id ? bulkQuantity : ''}
                            onChange={(e) => {
                              setSelectedProductForBulk(product.product_id);
                              setBulkQuantity(e.target.value);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold text-sm"
                            min="1"
                          />
                        </div>
                        <button
                          onClick={() => handleBulkAddStock(product.product_id)}
                          className="px-6 py-3 bg-[#b4a460] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#b4a460]/30 transition-all active:scale-95"
                          title="Add to all variants"
                        >
                          Bulk Add
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold mt-2">
                        Will add the same quantity to all {product.variants.length} variants
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <AlertCircle size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold">No variants available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-[3rem] py-24 text-center">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-gray-200" size={48} />
          </div>
          <h3 className="text-2xl font-black text-black">No Products Found</h3>
          <p className="text-gray-400 text-sm mt-2 font-medium">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default AddStock;