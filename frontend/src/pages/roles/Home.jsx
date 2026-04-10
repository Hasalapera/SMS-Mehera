import React, { useState } from 'react';
import { Search, ChevronDown, ShoppingCart, Star, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const ProductCard = ({ product, onAddToCart, isAdded }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all relative">
      <div className="relative aspect-square bg-[#C0B26D]/20 flex items-center justify-center overflow-hidden">
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">No Image</span>
        
        {/* බටන් එක අනිවාර්යයෙන්ම ක්ලික් වෙන්න z-50 සහ cursor-pointer දැම්මා */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute top-4 right-4 p-3 bg-white/90 text-black hover:bg-[#b4a460] hover:text-white rounded-xl transition-all shadow-md active:scale-90 z-50 cursor-pointer"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
        </button>

        {isAdded && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-all z-40">
            <div className="bg-[#b4a460] text-black text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 animate-bounce">
              <CheckCircle size={14} strokeWidth={3} /> ADDED
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-sm text-gray-800 leading-tight">{product.name}</h3>
            <p className="text-[10px] text-gray-400 uppercase font-black mt-1">Popular</p>
          </div>
          <p className="font-black text-[#b4a460] text-sm whitespace-nowrap">
            {product.price.toLocaleString()} LKR
          </p>
        </div>
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill="#b4a460" className="text-[#b4a460]" />
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addedProductId, setAddedProductId] = useState(null);

  const products = [
    { id: 1, name: "OPI Nail Polish", price: 6999, category: "Cosmetics" },
    { id: 2, name: "Sunscreen Lotion", price: 6999, category: "Skin Care" },
    { id: 3, name: "Wholesale Liquid", price: 6999, category: "Cleaning" },
    { id: 4, name: "Matte Lipstick", price: 4500, category: "Cosmetics" },
    { id: 5, name: "Hair Serum", price: 3200, category: "Hair Care" },
  ];

  const categories = ["Cosmetics", "Skin Care", "Hair Care", "Cleaning"];

  const handleAddToCart = (product) => {
    console.log("Add to cart button clicked for:", product.name); // බටන් එක වැඩද බලන්න මේක දැම්මා
    
    const saved = localStorage.getItem("active_order_cart");
    const existingCart = saved ? JSON.parse(saved) : [];
    
    const exists = existingCart.find(item => item.product_id === product.id);

    let updatedCart;
    if (exists) {
      updatedCart = existingCart.map(item => 
        item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      updatedCart = [...existingCart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1 
      }];
    }
    
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    console.log("LocalStorage Updated:", updatedCart);

    setAddedProductId(product.id);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-x-hidden p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-full mb-10 flex flex-col md:flex-row gap-5 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <Search size={20} className="text-[#b4a460]" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search Products..."
            className="w-full bg-[#F3F3F3] text-black pl-16 pr-6 py-4 rounded-[2.5rem] outline-none font-semibold text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="w-full md:w-auto bg-[#F3F3F3] text-black px-10 py-4 rounded-[2.5rem] font-black flex items-center gap-6 justify-between text-[11px] uppercase">
          All Categories <ChevronDown size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="max-w-full pb-20">
        {categories.map(cat => {
          const catProducts = products.filter(p => p.category === cat && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
          if (catProducts.length === 0) return null;

          return (
            <div key={cat} className="mb-12">
              <h2 className="text-black text-[10px] font-black px-1 py-2 inline-block mb-8 uppercase tracking-[0.3em] border-b-2 border-[#b4a460]">
                {cat} Section
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {catProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                    isAdded={addedProductId === product.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;