import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react"; 
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast"; 

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowedRoles = ["admin", "sales_rep", "online_store_keeper"];
  const canAddToOrder = user && allowedRoles.includes(user.role);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Invalid product id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(`http://localhost:5001/api/products/${id}`, config);
        const data = response.data?.product || response.data?.data || response.data;

        setProduct(data);
        setError(null);
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

  // --- ADD TO ORDER LOGIC (Fixed Notification Stalling) ---
  const handleAddToCart = (variant) => {
    // 1. කලින් තියෙන Toast එක අතින් Dismiss කරලා අලුත් එකකට ඉඩ හදනවා
    toast.dismiss(); 

    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    const cartItemId = `${product.product_id}-${variant.variant_id}`;
    const existingItemIndex = savedCart.findIndex(item => item.cartItemId === cartItemId);
    
    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingItemIndex].qty += 1;
    } else {
      updatedCart = [...savedCart, { 
        cartItemId,
        product_id: product.product_id,
        variant_id: variant.variant_id,
        variant_name: variant.variant_name,
        name: product.product_name,
        price: Number(variant.price),
        qty: 1
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus')); 

    // 2. 🔥 Luxury Style Toast (id එක අයින් කළා හිරවීම වැළැක්වීමට)
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
  const firstVariantPrice = variants.length > 0 ? Number(variants[0].price || 0) : 0;
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);

  return (
    <div className="w-full min-h-screen bg-background text-left">
      <div className="p-6 md:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMain/50 hover:text-textMain mb-8 font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Back to Inventory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE: Image & Description */}
          <div className="bg-card rounded-4xl shadow-md p-8 border border-border">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center">
                <div className="bg-background rounded-[2.5rem] w-full h-72 flex items-center justify-center p-6 border border-border shadow-inner">
                  <img src={product.image_url || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} alt={product.product_name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">{product.brand?.brand_name || "Premium Brand"}</span>
                <h2 className="text-2xl font-serif italic text-textMain leading-tight">{product.product_name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Status</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {formatStatus(product.status)}
                  </span>
                </div>
                <div className="bg-background p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Category</p>
                  <span className="text-[11px] font-bold text-textMain uppercase">{product.category?.category_name || "-"}</span>
                </div>
                <div className="bg-background p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Starting Price</p>
                  <span className="text-lg font-serif italic text-primary">{firstVariantPrice > 0 ? `Rs. ${firstVariantPrice.toLocaleString()}` : "N/A"}</span>
                </div>
                <div className="bg-background p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mb-1">Total Network Stock</p>
                  <span className="text-lg font-serif italic text-textMain">{totalStock} Units</span>
                </div>
              </div>

              <p className="text-textMain/50 leading-relaxed italic text-sm border-t border-border pt-4">
                {product.description || "No professional description available for this registry item."}
              </p>
            </div>
          </div>

          {/*RIGHT SIDE: Variants Table */}
          {variants.length > 0 && (
            <div className="bg-card rounded-4xl shadow-md overflow-hidden border border-border flex flex-col">
              <div className="bg-primary px-8 py-5 flex items-center justify-between">
                <h2 className="text-sm font-black text-black uppercase tracking-widest">Product Variations</h2>
                <span className="text-[10px] font-bold text-black/60">{variants.length} Variants</span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-card border-b border-border sticky top-0">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Variant</th>
                      <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">SKU</th>
                      <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Price</th>
                      <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-textMain/50">Stock</th>
                      {canAddToOrder && <th className="px-4 py-4 text-[9px] text-center font-black uppercase tracking-[0.2em] text-textMain/50">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.variant_id} className="border-b border-border hover:bg-background">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-background rounded-lg flex items-center justify-center p-2 shrink-0 border border-border">
                              <img src={variant.image_url || product.image_url} alt="v" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <span className="font-bold text-sm text-textMain">{variant.variant_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[10px] font-mono font-bold text-textMain/50 uppercase">{variant.sku}</td>
                        <td className="px-4 py-4 font-serif italic text-sm text-textMain">Rs. {Number(variant.price || 0).toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`font-bold text-sm ${Number(variant.stock_count || 0) <= 5 ? "text-red-500" : "text-textMain"}`}>
                            {variant.stock_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {canAddToOrder && (
                            <button 
                              onClick={() => handleAddToCart(variant)}
                              disabled={Number(variant.stock_count) <= 0}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black uppercase text-[8px] tracking-widest transition-all ml-auto ${
                                Number(variant.stock_count) <= 0 
                                ? "bg-background text-textMain/50 cursor-not-allowed" 
                                : "bg-black text-primary hover:scale-105 shadow-lg active:scale-95"
                              }`}
                            >
                              <PlusCircle size={12} />
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}