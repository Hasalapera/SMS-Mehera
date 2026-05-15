import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Package, AlertCircle,
  Loader2, ArrowLeft, RefreshCw, Trash2, CheckCircle2, ClipboardList, Undo2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
        'http://localhost:5001/api/stock/variants/batch-add-stock',
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
        'http://localhost:5001/api/stock/variants/batch-revert-stock',
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
      <div className="w-full min-h-screen bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-textMain/50 transition-colors duration-300 font-medium">
          <Loader2 className="animate-spin text-primary transition-all duration-300" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest">Loading Inventory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-in fade-in duration-500 transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-textMain flex items-center gap-3 tracking-tight transition-all duration-300">
            <div className="p-3 bg-primary rounded-2xl text-textMain shadow-xl">
              <Package size={24} />
            </div>
            Stock Management
          </h2>
          <p className="text-textMain/50 text-sm mt-2 ml-14 font-medium transition-all duration-300">Add and manage product stock levels across variants.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-3 bg-card border border-border rounded-xl text-textMain/50 hover:text-textMain hover:shadow-md transition-all active:scale-90 transition-colors duration-300"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textMain/50 hover:text-textMain font-bold text-sm px-2 transition-colors duration-300"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-[2.5rem] shadow-sm p-6 mb-8 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-textMain/50 transition-colors duration-300" />
          <input 
            type="text"
            placeholder="Search by product name..."
            className="flex-1 bg-transparent outline-none text-textMain font-semibold text-sm placeholder:text-textMain/40 transition-colors duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {lastAppliedSummary && (
        <div className="mb-8 bg-card border border-primary/30 rounded-3xl p-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles size={12} /> Last Apply Summary
              </p>
              <p className="text-sm font-bold text-textMain mt-1 transition-colors duration-300">
                {lastAppliedSummary.updatedVariants} variants updated, {lastAppliedSummary.totalUnits} units added
              </p>
              <p className="text-[11px] text-textMain/50 mt-1 transition-colors duration-300">Applied at {lastAppliedSummary.appliedAt}</p>
            </div>
            <button
              onClick={handleUndoLastApply}
              disabled={isUndoing}
              className="px-5 py-3 bg-black text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
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
          <div className="bg-card border border-border rounded-4xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="p-5 border-b border-border bg-card/50 flex items-center justify-between transition-colors duration-300">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-textMain/50 transition-colors duration-300">Product Rows</h3>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Click Product To Queue</span>
            </div>

            <div className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => addProductToQueue(product)}
                  className="w-full p-5 text-left hover:bg-background transition-colors duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-textMain uppercase tracking-tight transition-colors duration-300">{product.product_name}</p>
                      <p className="text-[11px] text-textMain/50 font-semibold mt-1 transition-colors duration-300">
                        Category: {product.category?.category_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-textMain/50 font-black uppercase tracking-widest transition-all duration-300">Variants</p>
                      <p className="text-lg font-black text-primary">{product.variants?.length || 0}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-card rounded-4xl shadow-xl border border-border overflow-hidden sticky top-6 transition-colors duration-300">
            <div className="p-5 border-b border-border bg-card/50 flex items-center justify-between transition-colors duration-300">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-textMain/50 flex items-center gap-2 transition-colors duration-300">
                <ClipboardList size={16} /> Stock Queue
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedProducts.length} Product(s)</span>
                <button
                  onClick={clearAllQueue}
                  className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-widest text-textMain/50 hover:text-red-600 hover:border-red-500/20 hover:bg-red-500/10 transition-colors duration-300"
                  title="Clear all queued products"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto p-4 space-y-4">
              {selectedProducts.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl">
                  <Package size={34} className="mx-auto text-textMain/20 mb-3 transition-colors duration-300" />
                  <p className="text-[11px] font-black text-textMain/50 uppercase tracking-widest transition-colors duration-300">No Products In Queue</p>
                </div>
              ) : (
                selectedProducts.map((product) => (
                  <div key={product.product_id} className="border border-border rounded-3xl overflow-hidden bg-background">
                    <div className="p-4 bg-card/50 border-b border-border flex items-center justify-between gap-3 transition-colors duration-300">
                      <div>
                        <p className="text-sm font-black text-textMain uppercase transition-colors duration-300">{product.product_name}</p>
                        <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest transition-colors duration-300">{product.category_name}</p>
                      </div>
                      <button
                        onClick={() => removeProductFromQueue(product.product_id)}
                        className="p-2 rounded-lg text-textMain/50 hover:text-red-500 hover:bg-red-500/10 transition-colors duration-300"
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {product.variants.map((variant) => (
                        <div key={variant.variant_id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                          <div>
                            <p className="text-[12px] font-bold text-textMain transition-colors duration-300">{variant.variant_name || 'Variant'}</p>
                            <p className="text-[10px] text-textMain/50 font-semibold transition-colors duration-300">{variant.stock_count} units • Rs. {variant.price.toLocaleString()} each</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={variant.qtyToAdd}
                            onChange={(e) => handleVariantQtyChange(product.product_id, variant.variant_id, e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 rounded-lg border border-border text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card text-textMain"
                          />
                        </div>
                      ))}

                      <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={product.bulkQty}
                          onChange={(e) => handleBulkQtyInput(product.product_id, e.target.value)}
                          placeholder="Bulk qty"
                          className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card text-textMain"
                        />
                        <button
                          onClick={() => applyBulkToProduct(product.product_id)}
                          className="w-full sm:w-auto px-3 py-2 bg-primary text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                        >
                          Fill All
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-card transition-colors duration-300">
              <button
                onClick={handleApplyAllStock}
                disabled={isApplying}
                className="w-full py-3 bg-black text-primary rounded-xl font-black uppercase text-[11px] tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> {isApplying ? 'Applying...' : 'Apply Stock Updates'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-[3rem] py-24 text-center transition-colors duration-300">
          <div className="bg-background w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-textMain/20" size={48} />
          </div>
          <h3 className="text-2xl font-black text-textMain">No Products Found</h3>
          <p className="text-textMain/50 text-sm mt-2 font-medium">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default AddStock;