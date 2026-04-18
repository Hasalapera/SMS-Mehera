import React from 'react';
import { useAuth } from '../pages/context/AuthContext';
import { ShoppingCart, Heart, Eye, LayoutGrid, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canAddOrders = user && ["admin", "sales_rep"].includes(user.role);

  const variants = product?.variants || [];
  const variantsPreview = variants.slice(0, 4);

  const firstVariant = variants.length > 0 ? variants[0] : null;
  const displayPrice = firstVariant ? firstVariant.price : product?.price;
  const displayStock = firstVariant ? firstVariant.stock_count : 0;

  

  // 🛡️ හැම තැනම පාවිච්චි කරන්න පුළුවන් පොදු function එකක්
  const handleNavigation = () => {
    if (user) {
      navigate(`/product/${product.product_id}`);
    } else {
      // ලොග් වුණාම ආපහු මේ product එකටම එන්න ඕන නම් state එකත් එක්ක යවන්න
      navigate('/login', { state: { from: `/product/${product.product_id}` } });
    }
  };

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#b4a460]/15 transition-all duration-500 border border-gray-100 flex flex-col h-full">
      
      {/* --- Image Container --- */}
      <div className="relative bg-[#F9F4DA]/50 aspect-square flex items-center justify-center overflow-hidden p-10">
        <img 
          src={product.image_url || "https://placehold.co/400x400/F9F4DA/9A8B50?text=No+Image"} 
          alt={product.product_name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
        />
        
        {/* Brand Badge */}
        <div className="absolute top-6 left-6">
          <span className="bg-black/90 backdrop-blur-sm text-[#b4a460] text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#b4a460]/20 shadow-lg">
            {product.brand?.brand_name || 'Mehera'}
          </span>
        </div>

        {/* Stock Level Badge */}
        <div className="absolute top-6 right-6">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${displayStock > 0 ? 'bg-white text-green-600' : 'bg-red-50 text-red-600'}`}>
            {displayStock > 0 ? `${displayStock} IN STOCK` : 'OUT OF STOCK'}
          </span>
        </div>

        {/* --- Side Hover Actions --- */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          {canAddOrders && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Card එක click වීම වළක්වයි
                if (onAddToCart) {
                  onAddToCart(); // 👈 Prop එකක් විදිහට ආපු function එක මෙතනදී run වෙනවා
                } else {
                  console.error("onAddToCart function is not provided to ProductCard");
                }
              }}
              className="p-3 bg-white text-[#b4a460] rounded-2xl shadow-xl hover:bg-black hover:text-[#b4a460] transition-all transform hover:scale-110 active:scale-95"
              title="Add to Order"
            >
              <ShoppingCart size={18} />
            </button>
          )}
          <button className="p-3 bg-white text-[#9A8B50] rounded-2xl shadow-xl hover:bg-black hover:text-[#b4a460] transition-all transform hover:scale-110">
            <Heart size={18} />
          </button>
          <button 
            onClick={handleNavigation} // 🛡️ මෙතනත් ආරක්ෂාව දැම්මා
            className="p-3 bg-white text-[#9A8B50] rounded-2xl shadow-xl hover:bg-black hover:text-[#b4a460] transition-all transform hover:scale-110"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* --- Product Details --- */}
      <div className="p-6 bg-white flex-1 flex flex-col text-left">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 overflow-hidden pr-2">
            <h3 className="text-base font-black text-black leading-tight truncate group-hover:text-[#b4a460] transition-colors uppercase tracking-tight">
              {product.product_name}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#b4a460]"></span>
              {product.category?.category_name || 'Premium Series'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-black tabular-nums tracking-tighter">
              {displayPrice ? `${Number(displayPrice).toLocaleString()} LKR` : 'Price on Req'}
            </p>
          </div>
        </div>

        {/* --- Variants & Main Button --- */}
        <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
          <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
            {variantsPreview?.length > 0 ? (
              variantsPreview.map((variant) => (
                <div key={variant.variant_id} className="w-9 h-9 rounded-full border-[3px] border-white overflow-hidden bg-white shadow-md ring-1 ring-gray-100 transition-transform hover:-translate-y-1">
                  <img src={variant.image_url || product.image_url} className="w-full h-full object-cover" alt="v" />
                </div>
              ))
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border-2 border-white text-gray-300">
                <LayoutGrid size={14} />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleNavigation} // 🛡️ මෙතනත් ආරක්ෂිතයි
            className="flex items-center justify-center w-10 h-10 bg-black text-[#b4a460] rounded-2xl hover:bg-[#1a1a1a] hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#b4a460]/20"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;