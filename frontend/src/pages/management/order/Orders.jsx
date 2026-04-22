import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, PlusCircle, History, TrendingUp, 
  Truck, Search, Package, ShoppingCart, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

// පවතින Components
import AddOrder from './AddOrder';
import ViewOrders from './ViewOrders';
import AddOnlineOrder from './AddOnlineOrder';
import ProductCard from '../../../components/ProductCard';

const Orders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // Variation Modal එක සඳහා
  const userRole = user?.role;

  // Inventory එක load කරගැනීම
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/products/getProducts');
        const data = res.data?.products || res.data;
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        toast.error("Inventory sync failed!");
      }
    };
    if (activeTab === 'create') fetchProducts();
  }, [activeTab]);

  // --- ADD TO CART LOGIC (With Variations) ---
  const handleAddToCart = (product, variant = null) => {
    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    
    // මිල සහ නම තීරණය කිරීම
    const unitPrice = variant ? Number(variant.price) : Number(product.price);
    const variantName = variant ? variant.variant_name : 'Standard';
    
    // Unique ID එකක් හදනවා (Product ID + Variant ID) එකම item එකේ shades වෙන් කර හඳුනාගන්න
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
        qty: 1 
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    
    // දකුණු පැත්තේ AddOrder component එකට දැනුම් දීම
    window.dispatchEvent(new Event('focus'));
    toast.success(`${variantName} added to order!`);
    setSelectedProduct(null); // Modal එක වහන්න
  };

  const tabs = [
    { id: 'create', label: 'Create Order', icon: PlusCircle, show: ['admin', 'sales_rep', 'online_store_keeper'].includes(userRole) },
    { id: 'history', label: 'Order History', icon: History, show: true },
    { id: 'analytics', label: 'Sales Insights', icon: TrendingUp, show: ['admin', 'manager'].includes(userRole) },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfb] p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-3xl font-serif text-black uppercase tracking-tight">
                Order <span className="italic text-[#b4a460]">Console</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2 italic">Official Mehera International Registry</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto w-full md:w-auto">
          {tabs.map((tab) => tab.show && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto">
        {activeTab === 'create' ? (
          <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
            
            {/* ⬅️ LEFT PANEL: LIVE INVENTORY */}
            <div className="xl:w-[55%] flex flex-col h-[850px]"> 
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                
                <div className="p-6 pb-4 border-b border-gray-50 bg-white">
                  <div className="flex justify-between items-center mb-4 text-left">
                    <div className="flex items-center gap-3">
                      <Package className="text-[#b4a460]" size={20} />
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-black">Live Inventory</h2>
                    </div>
                    <div className="bg-[#b4a460]/10 px-3 py-1 rounded-full">
                        <span className="text-[9px] font-black text-[#8a7b42] uppercase">{products.length} Items Syncing</span>
                    </div>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search cosmetics, shades or hair care..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all font-bold"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar bg-[#fcfcfc]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {products
                      .filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(product => (
                        <div key={product.product_id} className="transform scale-[0.95] origin-top-left">
                          <ProductCard 
                            product={product} 
                            onAddToCart={() => {
                              if (product.variants && product.variants.length > 0) {
                                setSelectedProduct(product);
                              } else {
                                handleAddToCart(product);
                              }
                            }} 
                          />
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ➡️ RIGHT PANEL: ROLE-BASED CONSOLE */}
            <div className="xl:w-[45%] h-[850px] overflow-y-auto no-scrollbar bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-2">
              {userRole === 'sales_rep' ? (
                <AddOrder />
              ) : userRole === 'online_store_keeper' ? (
                <AddOnlineOrder />
              ) : (userRole === 'admin' || userRole === 'manager') ? (
                <AddOrder />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center space-y-4">
                  <ShoppingCart size={48} className="opacity-10" />
                  <p className="text-xs font-black uppercase tracking-widest">Unauthorized Registry Access</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm p-2 animate-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'history' && <ViewOrders />}
          </div>
        )}
      </div>

      {/* --- VARIATION SELECTION MODAL --- */}
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
                        INSTOCK: {variant.stock_qty || 'Check Sync'}
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

export default Orders;