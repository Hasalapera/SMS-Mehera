import React, { useState } from 'react';
import { useAuth } from '../pages/context/AuthContext';
import { ShoppingCart, Heart, Eye, LayoutGrid, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNameExpanded, setIsNameExpanded] = useState(false);

  const userRole = user?.role?.toLowerCase();
  const canAddOrders = user && ["admin", "sales_rep", "online_store_keeper"].includes(userRole);
  const isInactive = product?.status !== 'active';
  const canEditInactive = user && ["admin", "manager"].includes(userRole);

  const variants = product?.variants || [];
  const variantsPreview = variants.slice(0, 4);

  const firstVariant = variants.length > 0 ? variants[0] : null;
  const displayPrice = firstVariant ? firstVariant.price : product?.price;
  // const displayStock = firstVariant ? firstVariant.stock_count : 0;

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();

      // 🔥 Mehera Theme Toast
      // toast.success(`${product.product_name} added to queue!`, {
      //   style: {
      //     borderRadius: '1.5rem',
      //     background: '#141414',
      //     color: '#b4a460',
      //     fontSize: '10px',
      //     fontWeight: '900',
      //     textTransform: 'uppercase',
      //     letterSpacing: '0.15em',
      //     padding: '16px 24px',
      //     border: '1px solid rgba(180, 164, 96, 0.2)',
      //     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      //   },
      //   iconTheme: { primary: '#b4a460', secondary: '#141414' },
      // });
    } else {
      console.error("onAddToCart function is not provided to ProductCard");
    }
  };

  const handleNavigation = () => {
    //anyone can show without login
    navigate(`/product/${product.product_id}`);
  };

  return (
    <div className={`group bg-card rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm border border-border flex flex-col h-full transition-colors duration-300 ${isInactive ? 'opacity-60 grayscale' : ''} ${(isInactive && !canEditInactive) ? 'cursor-not-allowed pointer-events-none' : 'hover:shadow-2xl hover:shadow-[#b4a460]/15 transition-all duration-500'}`}>
      
      {/* --- Image Container --- */}
      <div className="relative bg-card/50 aspect-square flex items-center justify-center overflow-hidden p-6 md:p-10 transition-all duration-300">
        <img 
          src={product.image_url || "https://placehold.co/400x400/F9F4DA/9A8B50?text=No+Image"} 
          alt={product.product_name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Brand Badge */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <span className="bg-black/90 backdrop-blur-sm text-primary text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-primary/20 shadow-lg transition-all duration-300">
            {product.brand?.brand_name || 'Mehera'}
          </span>
        </div>

        {/* Stock Level Badge */}
        {/* <div className="absolute top-6 right-6">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${displayStock > 0 ? 'bg-card transition-colors duration-300 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {displayStock > 0 ? `${displayStock} IN STOCK` : 'OUT OF STOCK'}
          </span>
        </div> */}

        {/* --- Side Hover Actions --- */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${(isInactive && !canEditInactive) ? 'hidden' : ''}`}>
          
          {/* ✅ ShoppingCart with Luxury Toast Notification */}
          {canAddOrders && !isInactive && (
            <button 
              onClick={handleAddToCartClick}
              className="p-3 bg-card text-primary rounded-2xl shadow-xl hover:bg-black hover:text-primary transition-all duration-300 transform hover:scale-110 active:scale-95"
              title="Add to Order"
            >
              <ShoppingCart size={18} />
            </button>
          )}

          <button className="p-3 bg-card text-[#9A8B50] rounded-2xl shadow-xl hover:bg-black hover:text-primary transition-all duration-300 transform hover:scale-110">
            <Heart size={18} />
          </button>
          <button 
            onClick={handleNavigation}
            className="p-3 bg-card text-[#9A8B50] rounded-2xl shadow-xl hover:bg-black hover:text-primary transition-all duration-300 transform hover:scale-110"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* --- Product Details --- */}
      <div className="p-4 md:p-6 bg-card flex-1 flex flex-col text-left transition-colors duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 overflow-hidden pr-2">
            <h3 
              title={product.product_name}
              onClick={() => setIsNameExpanded(!isNameExpanded)}
              className={`text-sm md:text-base font-black text-textMain leading-tight group-hover:text-primary transition-all duration-300 uppercase tracking-tight cursor-pointer ${isNameExpanded ? 'whitespace-normal' : 'truncate'}`}
            >
              {product.product_name}
            </h3>
            <p className="text-[9px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5 transition-colors duration-300">
              <span className="w-1 h-1 rounded-full bg-primary transition-all duration-300"></span>
              {product.category?.category_name || 'Premium Series'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs md:text-sm font-black text-textMain tabular-nums tracking-tighter transition-colors duration-300">
              {displayPrice ? `${Number(displayPrice).toLocaleString()} LKR` : 'Price on Req'}
            </p>
          </div>
        </div>

        {/* --- Variants & Actions --- */}
        <div className="mt-auto pt-5 border-t border-border flex items-center justify-between gap-2">
          <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
            {!isInactive && variantsPreview?.length > 0 ? (
              variantsPreview.map((variant) => (
                <div key={variant.variant_id} className="w-8 h-8 md:w-9 md:h-9 rounded-full border-[3px] border-white overflow-hidden bg-card shadow-md ring-1 ring-gray-100 hover:-translate-y-1 transition-all duration-300">
                  <img src={variant.image_url || product.image_url} className="w-full h-full object-cover" alt="v" />
                </div>
              ))
            ) : (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-card flex items-center justify-center border-2 border-white text-textMain/50 transition-colors duration-300">
                <LayoutGrid size={14} />
              </div>
            )}
          </div>
          
          {/* --- Desktop Chevron Button --- */}
          <button 
            onClick={handleNavigation}
            className="hidden md:flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-black text-primary rounded-xl md:rounded-2xl hover:bg-card hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-[#b4a460]/20"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>

          {/* --- Mobile Action Buttons --- */}
          <div className="flex md:hidden items-center gap-2">
            {canAddOrders && !isInactive && (
              <button 
                onClick={handleAddToCartClick}
                className="p-2.5 bg-black text-primary rounded-xl shadow-lg active:scale-95 transition-all duration-300"
                title="Add to Order"
              >
                <ShoppingCart size={16} />
              </button>
            )}
            <button className="p-2.5 bg-card border border-border text-textMain/60 rounded-xl shadow-sm active:scale-95 transition-all duration-300">
              <Heart size={16} />
            </button>
            <button 
              onClick={handleNavigation}
              className="p-2.5 bg-card border border-border text-textMain/60 rounded-xl shadow-sm active:scale-95 transition-all duration-300"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;