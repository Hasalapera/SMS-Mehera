import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-gray-100 ">
      {/* Image Container */}
      <div className="relative bg-[#C0B26D] aspect-square flex items-center justify-center overflow-hidden p-8">
        <img 
          src={product.image || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} 
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply"
        />
        
        {/* Hover Action Buttons - image එකේ තියෙන විදිහට */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-[#F9F4DA] text-[#9A8B50] rounded shadow-md hover:bg-white transition-colors">
            <ShoppingCart size={18} />
          </button>
          <button className="p-2 bg-[#F9F4DA] text-[#9A8B50] rounded shadow-md hover:bg-white transition-colors">
            <Heart size={18} />
          </button>
          <button className="p-2 bg-[#F9F4DA] text-[#9A8B50] rounded shadow-md hover:bg-white transition-colors">
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
            <p className="text-[10px] text-gray-500 italic">Popular</p>
          </div>
          <p className="text-sm font-bold text-[#A67C52]">{product.price} LKR</p>
        </div>
        <div className="flex mt-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-[#C0B26D] text-[10px]">★</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;