import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  Pencil,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { toast } from "react-hot-toast"; 

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getVariantDeletedAt = (variant = {}) => variant.deletedAt || variant.deleted_at || null;

const createVariantDraft = (variant = {}) => ({
  variant_id: variant.variant_id || null,
  sku: variant.sku || "",
  variant_name: variant.variant_name || "",
  price: variant.price ?? "",
  stock_count: variant.stock_count ?? "",
  critical_stock_level: variant.critical_stock_level ?? 5,
  variant_image: null,
  preview: variant.image_url || null,
  existing_image_url: variant.image_url || null,
  isDeleted: !!getVariantDeletedAt(variant),
});

const createEditForm = (source = {}) => ({
  product_name: source.product_name || "",
  brand_id: source.brand_id || "",
  category_id: source.category_id || "",
  description: source.description || "",
  status: source.status || "active",
  main_image: null,
  variants: Array.isArray(source.variants) && source.variants.length > 0
    ? source.variants.map((variant) => createVariantDraft(variant))
    : [createVariantDraft()],
});

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const allowedRoles = ["admin", "sales_rep", "online_store_keeper"];
  const canAddToOrder = user && allowedRoles.includes(user.role);
  const canEditProduct = user?.role === "admin";
  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Invalid product id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 💡 FIX: Force the browser to completely bypass the disk cache using strict Headers
        const config = {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: { _cb: new Date().getTime() } // Fallback cache-buster
        };

        const response = await api.get(`/products/${id}`, config);
        const data = response.data?.product || response.data?.data || response.data;

        setProduct(data);
        setError(null);
        setEditForm((current) => current || createEditForm(data));
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          return;
        }
        setProduct(null);
        setError(err.response?.status === 404 ? "Product not found" : "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token, logout]);

  const handleOpenEdit = async () => {
    if (!product) return;

    setEditLoading(true);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [brandResult, categoryResult] = await Promise.allSettled([
        api.get('/brands/getBrands', { headers }),
        api.get('/category/getCategories', { headers }),
      ]);

      const loadedBrands = brandResult.status === 'fulfilled'
        ? (brandResult.value.data.brands || brandResult.value.data || [])
        : [];
      const loadedCategories = categoryResult.status === 'fulfilled'
        ? (categoryResult.value.data.categories || categoryResult.value.data || [])
        : [];

      setBrands(loadedBrands.length > 0 ? loadedBrands : (product.brand ? [product.brand] : []));
      setCategories(loadedCategories.length > 0 ? loadedCategories : (product.category ? [product.category] : []));
      setEditForm(createEditForm(product));
      setMainImagePreview(product.image_url || null);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to open edit mode');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(product ? createEditForm(product) : null);
    setMainImagePreview(null);
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditForm((current) => ({ ...current, main_image: file }));
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleVariantFieldChange = (index, e) => {
    const { name, value } = e.target;
    setEditForm((current) => {
      const updatedVariants = [...current.variants];
      updatedVariants[index] = { ...updatedVariants[index], [name]: value };
      return { ...current, variants: updatedVariants };
    });
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditForm((current) => {
      const updatedVariants = [...current.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        variant_image: file,
        preview: URL.createObjectURL(file),
      };
      return { ...current, variants: updatedVariants };
    });
  };

  const addVariantField = () => {
    setEditForm((current) => ({
      ...current,
      variants: [...current.variants, createVariantDraft()],
    }));
  };

  const removeVariantField = (index) => {
    setEditForm((current) => {
      // If the product is being activated, all variants are considered "active" for this check.
      // Otherwise, only non-deleted variants are considered active.
      const activeVariants = current.variants.filter((v, i) => 
        (current.status === 'active' || !v.isDeleted) && i !== index
      );

      if (activeVariants.length === 0) {
        toast.error("At least one active variant is required!");
        return current;
      }

      return {
        ...current,
        variants: current.variants.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const restoreVariantField = (index) => {
    setEditForm((current) => {
      const updatedVariants = [...current.variants];
      updatedVariants[index] = { ...updatedVariants[index], isDeleted: false };
      return { ...current, variants: updatedVariants };
    });
  };

  const handleDeleteProduct = async () => {
    if (!product) return;

    const toastId = toast.custom((t) => (
      <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl border border-border bg-card p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-red-500/10 p-2 text-red-500">
            <Trash2 size={16} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-black text-textMain">Delete {product.product_name} and all of its variants?</p>
            <p className="mt-1 text-[11px] font-medium text-textMain/60">
              This will soft-delete the product and every related variant.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  toast.dismiss(toastId);
                  try {
                    setDeleting(true);
                    const response = await api.delete(`/products/${id}`, {
                      headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                    });

                    toast.success(response.data?.message || 'Product deleted successfully');
                    await refreshNotifications();
                    navigate('/inventory');
                  } catch (err) {
                    toast.error(err.response?.data?.error || 'Failed to delete product');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="rounded-xl bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-primary/90"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => toast.dismiss(toastId)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-[10px] font-black uppercase tracking-widest text-textMain/60 hover:bg-card"
              >
                Cancel
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(toastId)}
            className="text-textMain/40 hover:text-textMain"
            aria-label="Close confirmation"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!editForm) return;

    try {
      setSaving(true);

      const data = new FormData();
      data.append('product_name', editForm.product_name);
      data.append('brand_id', editForm.brand_id);
      data.append('category_id', editForm.category_id);
      data.append('description', editForm.description);
      data.append('status', editForm.status);

      if (editForm.main_image) {
        data.append('main_image', editForm.main_image);
      }

      // If activating the product, include all variants for restoration. Otherwise, only include active ones.
      const variantsToSave = editForm.status === 'active' ? 
        editForm.variants : 
        editForm.variants.filter(v => !v.isDeleted);
      
      data.append('variants', JSON.stringify(variantsToSave.map((variant) => ({
        variant_id: variant.variant_id,
        sku: variant.sku,
        variant_name: variant.variant_name,
        price: variant.price,
        stock_count: variant.stock_count,
        critical_stock_level: variant.critical_stock_level,
        hasImage: Boolean(variant.variant_image),
        existing_image_url: variant.existing_image_url,
      }))));

      variantsToSave.forEach((variant) => {
        if (variant.variant_image) {
          data.append('variant_images', variant.variant_image);
        }
      });

      const response = await api.put(`/products/${id}`, data, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedProduct = response.data?.product || response.data?.data || response.data;
      setProduct(updatedProduct);
      setError(null);
      setIsEditing(false);
      setEditForm(createEditForm(updatedProduct));
      setMainImagePreview(null);
      await refreshNotifications();
      toast.success('Product updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (editLoading) {
    return (
      <div className="p-8 bg-background transition-all duration-300 min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={42} />
        <p className="text-textMain/50 font-bold uppercase tracking-widest text-[10px]">Opening inline editor...</p>
      </div>
    );
  }

  // --- ADD TO ORDER LOGIC (Fixed Notification Stalling) ---
  const handleAddToCart = (variant) => {
    toast.dismiss(); 

    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    const cartItemId = `${product.product_id}-${variant.variant_id}`;
    const existingItemIndex = savedCart.findIndex(item => item.cartItemId === cartItemId);
    
    let updatedCart;
    if (existingItemIndex > -1) {
      if (savedCart[existingItemIndex].qty + 1 > variant.stock_count) {
        toast.error(`Cannot add more! Only ${variant.stock_count} units available in stock.`);
        return;
      }
      updatedCart = [...savedCart];
      updatedCart[existingItemIndex].qty += 1;
    } else {
      if (variant.stock_count < 1) {
        toast.error("Item is out of stock!");
        return;
      }
      updatedCart = [...savedCart, { 
        cartItemId,
        product_id: product.product_id,
        variant_id: variant.variant_id,
        variant_name: variant.variant_name,
        name: product.product_name,
        price: Number(variant.price),
        qty: 1,
        stock_count: variant.stock_count
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus')); 
    toast.success(`${variant.variant_name} added to order!`, {
      style: {
        borderRadius: '1.5rem',
        background: '#141414',
        color: '#b4a460',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        padding: '16px 24px',
        border: '1px solid rgba(180, 164, 96, 0.2)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      },
      iconTheme: {
        primary: '#b4a460',
        secondary: '#141414',
      },
    });
  };

  if (loading) {
    return (
      <div className="p-8 bg-background transition-all duration-300 min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={42} />
        <p className="text-textMain/50 font-bold uppercase tracking-widest text-[10px]">Syncing Product Registry...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-background transition-all duration-300 min-h-screen">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMain/50 hover:text-textMain mb-8 font-medium">
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="text-center py-24 text-textMain/50 font-serif italic">
          <p className="text-2xl">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const activeVariantCount = variants.filter((variant) => !getVariantDeletedAt(variant)).length;
  const firstVariantPrice = variants.length > 0 ? Number(variants[0].price || 0) : 0;
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);

  if (isEditing && editForm) {
    return (
      <div className="w-full min-h-screen bg-background text-left">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <button onClick={handleCancelEdit} className="flex items-center gap-2 text-textMain/50 hover:text-textMain font-black uppercase text-[10px] tracking-widest">
              <ArrowLeft size={16} /> Back to Product
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Inline Edit Mode</span>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-4xl shadow-md p-8 border border-border">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-center">
                    <div className="bg-background rounded-[2.5rem] w-full h-72 flex items-center justify-center p-6 border border-border shadow-inner relative overflow-hidden">
                      {mainImagePreview ? (
                        <img src={mainImagePreview} alt={editForm.product_name || product.product_name} className="w-full h-full object-contain mix-blend-normal" />
                      ) : (
                        <img src={product.image_url || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} alt={product.product_name} className="w-full h-full object-contain mix-blend-normal" />
                      )}
                      <label className="absolute bottom-4 right-4 flex items-center gap-2 bg-black text-primary rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-xl">
                        <Upload size={14} /> Change Image
                        <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Edit Product Details</span>
                    <input
                      type="text"
                      name="product_name"
                    required
                      value={editForm.product_name}
                      onChange={handleEditFieldChange}
                      className="w-full text-2xl font-serif italic text-textMain leading-tight bg-transparent border-b border-border focus:border-primary outline-none pb-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-background p-4 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Status</p>
                      <select name="status" value={editForm.status} onChange={handleEditFieldChange} className="w-full bg-card text-textMain border border-border rounded-xl px-3 py-2 font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="bg-background p-4 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Category</p>
                    <select name="category_id" required value={editForm.category_id} onChange={handleEditFieldChange} className="w-full bg-card text-textMain border border-border rounded-xl px-3 py-2 font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select Category</option>
                        {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-background p-4 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Brand</p>
                    <select name="brand_id" required value={editForm.brand_id} onChange={handleEditFieldChange} className="w-full bg-card text-textMain border border-border rounded-xl px-3 py-2 font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select Brand</option>
                        {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-background p-4 rounded-2xl border border-border">
                    <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-2">Description</p>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFieldChange}
                      rows="4"
                      className="w-full bg-transparent border border-border rounded-xl p-3 text-sm outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-4xl shadow-md overflow-hidden border border-border flex flex-col">
                <div className="bg-primary px-8 py-5 flex items-center justify-between">
                  <h2 className="text-sm font-black text-black uppercase tracking-widest">Product Variations</h2>
                  <button type="button" onClick={addVariantField} className="text-[10px] font-bold text-black/70 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle size={14} /> Add Variant
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-4 max-h-[72vh]">
                  <div className="hidden md:grid grid-cols-[96px_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-4 px-2 pb-1 text-[9px] font-black uppercase tracking-[0.25em] text-textMain/40">
                    <span>Variant Image</span>
                    <span>Variant / SKU</span>
                    <span>Price</span>
                    <span>Stock / Critical</span>
                  </div>

                  {editForm.variants.map((variant, index) => (
                    <div key={variant.variant_id || index} className={`bg-background rounded-3xl border border-border p-4 ${variant.isDeleted && editForm.status !== 'active' ? 'opacity-50 grayscale' : ''}`}>
                      {variant.isDeleted && editForm.status !== 'active' ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center border border-border overflow-hidden">
                              <img src={variant.preview || "https://placehold.co/100x100"} alt="Deleted Variant" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-textMain">{variant.variant_name || "Unnamed Variant"}</p>
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Deleted Variant</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => restoreVariantField(index)} className="rounded-full bg-green-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-md">
                            Activate
                          </button>
                        </div>
                      ) : (
                      <>
                      <div className="flex flex-col md:grid md:grid-cols-[96px_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-4 items-start relative pt-4 md:pt-0">
                        {/* Remove Variant Button */}
                        {!variant.variant_id && (
                          <button type="button" onClick={() => removeVariantField(index)} className="absolute top-0 right-0 md:top-0 md:-right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 active:scale-95 transition-all z-10" title="Remove Variant">
                            <X size={14} strokeWidth={3} />
                          </button>
                        )}
                        <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center p-2 shrink-0 border border-border overflow-hidden relative">
                          {variant.preview ? (
                            <img src={variant.preview} alt="Variant" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon size={20} className="text-textMain/40" />
                          )}
                          <label className="absolute inset-0 cursor-pointer" title="Change variant image">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantImageChange(index, e)} />
                          </label>
                        </div>

                        <div className="grid gap-2 w-full">
                          <label className="text-[9px] font-black uppercase tracking-widest text-textMain/40">Variant Name</label>
                          <input type="text" name="variant_name" required value={variant.variant_name} onChange={(e) => handleVariantFieldChange(index, e)} placeholder="Variant Name" className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                        </div>

                        <div className="grid gap-2 w-full">
                          <label className="text-[9px] font-black uppercase tracking-widest text-textMain/40">SKU</label>
                          <input type="text" name="sku" required value={variant.sku} onChange={(e) => handleVariantFieldChange(index, e)} placeholder="SKU" className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                        </div>

                        <div className="grid gap-2 w-full">
                          <label className="text-[9px] font-black uppercase tracking-widest text-textMain/40">Price</label>
                          <input type="number" name="price" required value={variant.price} onChange={(e) => handleVariantFieldChange(index, e)} placeholder="Price" className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                        </div>

                        <div className="grid gap-2 w-full">
                          <label className="text-[9px] font-black uppercase tracking-widest text-textMain/40">Stock</label>
                          <input type="number" name="stock_count" required value={variant.stock_count} onChange={(e) => handleVariantFieldChange(index, e)} placeholder="Stock" className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                          <label className="text-[9px] font-black uppercase tracking-widest text-red-500 mt-2 flex items-center gap-1">
                            <AlertTriangle size={10} /> Critical Stock Level
                          </label>
                          <input type="number" name="critical_stock_level" required value={variant.critical_stock_level} onChange={(e) => handleVariantFieldChange(index, e)} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-textMain/35">
                        <span className="inline-flex items-center gap-2"><ImageIcon size={12} /> Tap image to replace</span>
                        <span className="inline-flex items-center gap-2"><AlertTriangle size={12} /> Critical level required</span>
                      </div>
                      </>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-center mt-6">
                    <button 
                      type="button" 
                      onClick={addVariantField} 
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border-2 border-dashed border-primary px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm hover:bg-primary hover:text-black transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                    >
                      <PlusCircle size={16} /> Add Another Variant
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-[10px] font-black uppercase tracking-widest text-textMain/60 hover:text-textMain transition-colors">
                <X size={14} /> Cancel
              </button>
              <button type="submit" disabled={saving} className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 bg-primary hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 transition-all text-textMain px-5 sm:px-8 text-[10px] font-bold uppercase tracking-widest sm:tracking-[0.15em] whitespace-nowrap shadow-xl shadow-[#b4a460]/20 rounded-2xl">
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving Changes...' : 'Save Product Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-left animate-in fade-in duration-500">
      <div className="p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMain/50 hover:text-textMain font-black uppercase text-[10px] tracking-widest group">
            <ArrowLeft size={16} /> Back to Inventory
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end w-full md:w-auto">
            {canEditProduct && (
              <button
                type="button"
                onClick={handleOpenEdit} // This function is already defined
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Pencil size={16} />
                Edit Product
              </button>
            )}

            {canEditProduct && (
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT SIDE: Image & Description */}
          <div className="lg:col-span-2 bg-card rounded-[2.5rem] shadow-md p-6 md:p-8 border border-border">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center">
                <div className="bg-background rounded-[2rem] w-full h-72 flex items-center justify-center p-6 border border-border shadow-inner relative overflow-hidden">
                  <img src={product.image_url || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} alt={product.product_name} className="w-full h-full object-contain mix-blend-normal" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">{product.brand?.brand_name || "Premium Brand"}</span>
                <h2 className="text-3xl font-serif italic text-textMain leading-tight">{product.product_name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Status</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {formatStatus(product.status)}
                  </span>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Category</p>
                  <span className="text-[11px] font-bold text-textMain uppercase">{product.category?.category_name || "-"}</span>
                </div>
              </div>

              <p className="text-textMain/60 leading-relaxed italic text-sm border-t border-border pt-6">
                {product.description || "No professional description available for this registry item."}
              </p>
            </div>
          </div>

          {/*RIGHT SIDE: Variants Table */}
          <div className="lg:col-span-3 bg-card rounded-[2.5rem] shadow-md overflow-hidden border border-border flex flex-col">
            <div className="bg-card px-6 md:px-8 py-5 flex items-center justify-between border-b border-border">
              <h2 className="text-sm font-black text-textMain uppercase tracking-widest">Available Variants</h2>
              <span className="text-[10px] font-bold text-textMain/50">{activeVariantCount} Active / {variants.length} Total</span>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto flex-1 hidden md:block">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-background/50 border-b border-border sticky top-0">
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Variant</th>
                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">SKU</th>
                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Price</th>
                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Stock</th>
                    {canAddToOrder && <th className="px-6 py-3 text-[9px] text-right font-black uppercase tracking-[0.2em] text-textMain/50">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {variants.length > 0 ? (
                    variants.map((variant) => {
                      const isEffectivelyDisabled = !isAdminOrManager && (getVariantDeletedAt(variant) || product.status === 'inactive');
                      return (
                        <tr
                          key={variant.variant_id}
                          className={`border-b border-border last:border-0 ${isEffectivelyDisabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-background'}`}
                        >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center p-1 shrink-0 border border-border">
                              <img src={variant.image_url || product.image_url} alt="v" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-textMain">{variant.variant_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[10px] font-mono font-bold text-textMain/50 uppercase">{variant.sku}</td>
                        <td className="px-4 py-4 font-serif italic text-xs text-textMain">Rs. {Number(variant.price || 0).toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`font-bold text-xs ${Number(variant.stock_count || 0) <= 5 ? "text-red-500" : "text-textMain"}`}>
                            {variant.stock_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {canAddToOrder && product.status === 'active' && (
                            <button 
                              onClick={() => handleAddToCart(variant)}
                              disabled={Number(variant.stock_count) <= 0}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black uppercase text-[8px] tracking-widest transition-all ml-auto ${
                                Number(variant.stock_count) <= 0 
                                ? "bg-background text-textMain/50 cursor-not-allowed" 
                                : "bg-black text-primary hover:scale-105 shadow-lg active:scale-95"
                              }`}
                            >
                              <PlusCircle size={10} />
                              Add
                            </button>
                          )}
                        </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={canAddToOrder ? 5 : 4} className="px-6 py-14 text-center text-textMain/40 text-sm italic">No variants available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {variants.length > 0 ? (
                variants.map((variant) => {
                  const isEffectivelyDisabled = !isAdminOrManager && (getVariantDeletedAt(variant) || product.status === 'inactive');
                  return (
                    <div key={variant.variant_id} className={`bg-background p-4 rounded-2xl border border-border ${isEffectivelyDisabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center p-1 shrink-0 border border-border">
                            <img src={variant.image_url || product.image_url} alt="v" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-textMain">{variant.variant_name}</p>
                            <p className="text-[10px] font-mono font-bold text-textMain/50 uppercase">{variant.sku}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${Number(variant.stock_count || 0) <= 5 ? "text-red-500" : "text-textMain"}`}>{variant.stock_count}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <p className="font-serif italic text-lg text-textMain">Rs. {Number(variant.price || 0).toLocaleString()}</p>
                        {canAddToOrder && product.status === 'active' && (
                          <button onClick={() => handleAddToCart(variant)} disabled={Number(variant.stock_count) <= 0} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all ${Number(variant.stock_count) <= 0 ? "bg-card text-textMain/50 cursor-not-allowed" : "bg-black text-primary"}`}>
                            <PlusCircle size={12} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-14 text-center text-textMain/40 text-sm italic">No variants available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}