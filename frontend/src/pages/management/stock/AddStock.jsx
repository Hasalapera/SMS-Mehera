import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Package, AlertCircle,
  Loader2, ArrowLeft, RefreshCw, Trash2, CheckCircle2, ClipboardList, Undo2, Sparkles
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [lastAppliedSummary, setLastAppliedSummary] = useState(null);

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

  const addProductToQueue = (product) => {
    const alreadyAdded = selectedProducts.some((p) => p.product_id === product.product_id);
    if (alreadyAdded) {
      toast('Product already in stock queue');
      return;
    }

    const queueProduct = {
      product_id: product.product_id,
      product_name: product.product_name,
      category_name: product.category?.category_name || 'N/A',
      variants: (product.variants || []).map((v) => ({
        variant_id: v.variant_id,
        variant_name: v.variant_name,
        price: Number(v.price || 0),
        stock_count: Number(v.stock_count || 0),
        qtyToAdd: ''
      })),
      bulkQty: ''
    };

    setSelectedProducts((prev) => [...prev, queueProduct]);
  };

  const removeProductFromQueue = (productId) => {
    const shouldRemove = window.confirm('Remove this product from the stock queue?');
    if (!shouldRemove) return;
    setSelectedProducts((prev) => prev.filter((p) => p.product_id !== productId));
  };

  const clearAllQueue = () => {
    if (selectedProducts.length === 0) return;
    const shouldClear = window.confirm('Clear all products from the stock queue?');
    if (!shouldClear) return;
    setSelectedProducts([]);
  };

  const handleVariantQtyChange = (productId, variantId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.product_id !== productId
          ? product
          : {
              ...product,
              variants: product.variants.map((variant) =>
                variant.variant_id === variantId ? { ...variant, qtyToAdd: value } : variant
              )
            }
      )
    );
  };

  const handleBulkQtyInput = (productId, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.product_id === productId ? { ...product, bulkQty: value } : product
      )
    );
  };

  const applyBulkToProduct = (productId) => {
    const product = selectedProducts.find((p) => p.product_id === productId);
    if (!product) return;

    const parsedQty = Number(product.bulkQty);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      toast.error('Bulk quantity must be a positive whole number');
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.product_id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) => ({ ...v, qtyToAdd: String(parsedQty) }))
            }
      )
    );
  };

  const handleApplyAllStock = async () => {
    const updates = [];

    selectedProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        const qty = Number(variant.qtyToAdd);
        if (Number.isInteger(qty) && qty > 0) {
          updates.push({ variant_id: variant.variant_id, quantity: qty });
        }
      });
    });

    if (updates.length === 0) {
      toast.error('Add at least one valid quantity before applying stock');
      return;
    }

    try {
      setIsApplying(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        'http://localhost:5001/api/products/variants/batch-add-stock',
        { updates },
        config
      );

      const summary = response.data?.summary || {};
      const appliedUpdates = response.data?.appliedUpdates || updates;
      const updatedVariants = Number(summary.updatedVariants || appliedUpdates.length || 0);
      const totalUnits = Number(summary.totalUnits || 0);

      toast.success(`Stock updated for ${updatedVariants} variant(s)`);
      setLastAppliedSummary({
        updatedVariants,
        totalUnits,
        updates: appliedUpdates.map((u) => ({ variant_id: u.variant_id, quantity: Number(u.quantity) })),
        appliedAt: new Date().toLocaleString()
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply stock updates');
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndoLastApply = async () => {
    if (!lastAppliedSummary?.updates?.length) {
      toast.error('No recent stock update to undo');
      return;
    }

    try {
      setIsUndoing(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        'http://localhost:5001/api/products/variants/batch-revert-stock',
        { updates: lastAppliedSummary.updates },
        config
      );

      const reverted = Number(response.data?.summary?.revertedVariants || lastAppliedSummary.updates.length);
      toast.success(`Reverted stock update for ${reverted} variant(s)`);
      setLastAppliedSummary(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to undo last apply');
    } finally {
      setIsUndoing(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search);
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-white">
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

      {lastAppliedSummary && (
        <div className="mb-8 bg-white border border-[#b4a460]/30 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b4a460] flex items-center gap-2">
                <Sparkles size={12} /> Last Apply Summary
              </p>
              <p className="text-sm font-bold text-black mt-1">
                {lastAppliedSummary.updatedVariants} variants updated, {lastAppliedSummary.totalUnits} units added
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Applied at {lastAppliedSummary.appliedAt}</p>
            </div>
            <button
              onClick={handleUndoLastApply}
              disabled={isUndoing}
              className="px-5 py-3 bg-black text-[#b4a460] rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-[#b4a460]/30 transition-all disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Undo2 size={14} /> {isUndoing ? 'Undoing...' : 'Undo Last Apply'}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-100 rounded-4xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400">Product Rows</h3>
              <span className="text-[10px] font-black text-[#b4a460] uppercase tracking-widest">Click Product To Queue</span>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => addProductToQueue(product)}
                  className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-black uppercase tracking-tight">{product.product_name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold mt-1">
                        Category: {product.category?.category_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Variants</p>
                      <p className="text-lg font-black text-[#b4a460]">{product.variants?.length || 0}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <ClipboardList size={16} /> Stock Queue
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-[#b4a460] uppercase tracking-widest">{selectedProducts.length} Product(s)</span>
                <button
                  onClick={clearAllQueue}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  title="Clear all queued products"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto p-4 space-y-4">
              {selectedProducts.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <Package size={34} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No Products In Queue</p>
                </div>
              ) : (
                selectedProducts.map((product) => (
                  <div key={product.product_id} className="border border-gray-100 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-black uppercase">{product.product_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category_name}</p>
                      </div>
                      <button
                        onClick={() => removeProductFromQueue(product.product_id)}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {product.variants.map((variant) => (
                        <div key={variant.variant_id} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                          <div>
                            <p className="text-[12px] font-bold text-black">{variant.variant_name || 'Variant'}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">Current: {variant.stock_count} | Rs. {variant.price.toLocaleString()}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={variant.qtyToAdd}
                            onChange={(e) => handleVariantQtyChange(product.product_id, variant.variant_id, e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-[#b4a460] focus:ring-2 focus:ring-[#b4a460]/20"
                          />
                        </div>
                      ))}

                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={product.bulkQty}
                          onChange={(e) => handleBulkQtyInput(product.product_id, e.target.value)}
                          placeholder="Bulk qty"
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-[#b4a460] focus:ring-2 focus:ring-[#b4a460]/20"
                        />
                        <button
                          onClick={() => applyBulkToProduct(product.product_id)}
                          className="px-3 py-2 bg-[#b4a460] text-black rounded-lg text-[10px] font-black uppercase tracking-widest"
                        >
                          Fill All
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleApplyAllStock}
                disabled={isApplying}
                className="w-full py-3 bg-black text-[#b4a460] rounded-xl font-black uppercase text-[11px] tracking-widest hover:shadow-lg hover:shadow-[#b4a460]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> {isApplying ? 'Applying...' : 'Apply Stock Updates'}
              </button>
            </div>
          </div>
        </div>
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