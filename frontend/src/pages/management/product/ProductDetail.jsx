import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react"; // PlusCircle එකතු කළා
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast"; // ටෝස්ට් එකක් දාන්න

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // --- ADD TO CART LOGIC (Queue එකට ඇඩ් කිරීම) ---
  const handleAddToCart = (variant) => {
    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    
    // Unique ID එකක් හදාගන්නවා
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
        name: `${product.product_name} (${variant.variant_name})`, 
        price: Number(variant.price),
        qty: 1 
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus')); // Dashboard එකට signal එකක් දෙනවා
    toast.success(`${variant.variant_name} added to order queue!`);
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#f5f5f0] min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#c9a84c]" size={42} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Product Registry...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-[#f5f5f0] min-h-screen">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium">
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="text-center py-24 text-gray-400 font-serif italic">
          <p className="text-2xl">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const firstVariantPrice = variants.length > 0 ? Number(variants[0].price || 0) : 0;
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);

  return (
    <div className="p-8 bg-[#f5f5f0] min-h-screen font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 font-black uppercase text-[10px] tracking-widest transition-colors">
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-10 mb-10 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div className="flex items-center justify-center">
            <div className="bg-gray-50 rounded-[2.5rem] w-full h-[400px] flex items-center justify-center p-10 border border-gray-100 shadow-inner">
              <img src={product.image_url || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} alt={product.product_name} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6 text-left">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a84c] mb-2 block">{product.brand?.brand_name || "Premium Brand"}</span>
                <h1 className="text-4xl font-serif italic text-black leading-tight">{product.product_name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {formatStatus(product.status)}
                  </span>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Category</p>
                  <span className="text-[11px] font-bold text-black uppercase">{product.category?.category_name || "-"}</span>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Starting Price</p>
                  <span className="text-xl font-serif italic text-[#c9a84c]">{firstVariantPrice > 0 ? `Rs. ${firstVariantPrice.toLocaleString()}` : "N/A"}</span>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Network Stock</p>
                  <span className="text-xl font-serif italic text-black">{totalStock} Units</span>
               </div>
            </div>

            <p className="text-gray-500 leading-relaxed italic text-sm border-t border-gray-50 pt-6">
              {product.description || "No professional description available for this registry item."}
            </p>
          </div>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="bg-[#1a1a1a] px-10 py-6 flex items-center justify-between">
            <h2 className="text-white font-serif italic text-xl">Product Variations & Shades</h2>
            <span className="text-[#c9a84c] text-[10px] font-black uppercase tracking-widest">{variants.length} Variants Available</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Variant</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">SKU</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Unit Price</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Stock Status</th>
                  <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={variant.variant_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                           <img src={variant.image_url || product.image_url} alt="v" className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="font-bold text-sm text-black">{variant.variant_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-mono font-bold text-gray-400 uppercase">{variant.sku}</td>
                    <td className="px-8 py-5 font-serif italic text-lg text-black">Rs. {Number(variant.price || 0).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg ${Number(variant.stock_count || 0) <= 5 ? "text-red-500" : "text-black"}`}>
                          {variant.stock_count}
                        </span>
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">In Stock</span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-right">
                      {/* ✅ ✅ මෙන්න ADD TO CART බටන් එක ✅ ✅ */}
                      <button 
                        onClick={() => handleAddToCart(variant)}
                        disabled={Number(variant.stock_count) <= 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ml-auto ${
                          Number(variant.stock_count) <= 0 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-black text-[#c9a84c] hover:scale-105 shadow-lg active:scale-95"
                        }`}
                      >
                        <PlusCircle size={14} />
                        Add To Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}