import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, PackageSearch, X, PlusCircle } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // Modal එක පාලනය කිරීමට
  const { token } = useAuth();

  // 1. Backend එකෙන් දත්ත ගැනීම
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get('http://localhost:5001/api/products/getProducts', config);
        const data = response.data?.products || response.data;
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  // 2. Search Filter
  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ADD TO CART LOGIC (With Luxury Notification & Variants) ---
  const handleAddToCart = (product, variant = null) => {
    toast.dismiss(); // පරණ නොටිෆිකේෂන් අයින් කරයි

    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    
    // මිල සහ Variant නම තීරණය කිරීම
    const unitPrice = variant ? Number(variant.price) : (product.price || 0);
    const variantName = variant ? variant.variant_name : 'Standard';
    const cartItemId = variant ? `${product.product_id}-${variant.variant_id}` : product.product_id;

    const existingItemIndex = savedCart.findIndex(item => item.cartItemId === cartItemId);
    
    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingItemIndex].qty += 1;
    } else {
      updatedCart = [...savedCart, { 
        cartItemId,
        product_id: product.product_id, 
        variant_id: variant?.variant_id || null,
        variant_name: variantName,
        name: product.product_name, 
        price: unitPrice,
        qty: 1,
        image: product.image_url
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus')); // අනිත් Components වලට දැනුම් දීම

    // 🔥 Mehera Luxury Style Toast
    toast.success(`${variantName} added to order!`, {
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      iconTheme: {
        primary: '#b4a460',
        secondary: '#141414',
      },
    });

    setSelectedProduct(null); // Modal එක වහන්න
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] text-black overflow-x-hidden text-left">
      
      {/* HEADER */}
      <div className="w-full px-6 pt-10 pb-4">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              Inventory Catalog
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#b4a460]"></span>
              Browse products and check real-time stock
          </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-full px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <input 
            type="text" 
            placeholder="Search by Product Name..." 
            className="w-full bg-white border border-gray-200 text-black px-12 py-4 rounded-3xl outline-none font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#b4a460] transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button className="bg-black text-[#b4a460] px-8 py-4 rounded-3xl font-bold flex items-center gap-2 min-w-[200px] justify-between shadow-xl">
          All Categories <ChevronDown size={18} />
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="max-w-full px-6 p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#b4a460]" size={42} />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Updating Catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                onAddToCart={() => {
                  // Variants තියෙනවා නම් Modal එක පෙන්වනවා, නැත්නම් කෙලින්ම ඇඩ් කරනවා
                  if (product.variants && product.variants.length > 0) {
                    setSelectedProduct(product);
                  } else {
                    handleAddToCart(product);
                  }
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-300">
             <PackageSearch size={64} strokeWidth={1} />
             <p className="mt-4 font-bold uppercase text-xs tracking-widest">No Products Found</p>
          </div>
        )}
      </div>

      {/* --- VARIATION SELECTION MODAL  --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 space-y-8 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-serif italic text-black leading-tight">{selectedProduct.product_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-[2px] bg-[#b4a460]"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Shades / Variants</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant.variant_id}
                    onClick={() => handleAddToCart(selectedProduct, variant)}
                    className="flex justify-between items-center p-6 bg-gray-50 hover:bg-[#b4a460]/10 border border-gray-100 hover:border-[#b4a460]/30 rounded-3xl transition-all group w-full"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-[12px] uppercase tracking-wider text-black group-hover:text-[#b4a460] transition-colors">
                        {variant.variant_name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold mt-1">
                        INSTOCK: {variant.stock_qty || variant.stock_count || 'Check Sync'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="font-serif italic text-xl text-black">
                        Rs. {Number(variant.price).toLocaleString()}
                      </span>
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-black group-hover:text-[#b4a460] transition-all transform group-hover:scale-110">
                        <PlusCircle size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-red-500 transition-colors"
              >
                Close Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;