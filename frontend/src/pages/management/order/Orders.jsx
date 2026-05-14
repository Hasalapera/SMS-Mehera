import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, PlusCircle, History, TrendingUp, 
  Truck, Search, Package, ShoppingCart, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
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
  const [selectedProduct, setSelectedProduct] = useState(null); 
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

  const handleAddToCart = (product, variant = null) => {
    toast.dismiss();
    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    
    const unitPrice = variant ? Number(variant.price) : Number(product.price);
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
        qty: 1 
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus'));

    toast.success(`${variantName} added to order!`, {
      id: cartItemId,
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
      iconTheme: { primary: '#b4a460', secondary: '#141414' },
    });
    setSelectedProduct(null); 
  };

  const tabs = [
    { id: 'create', label: 'Create Order', icon: PlusCircle, show: ['admin', 'sales_rep', 'online_store_keeper'].includes(userRole) },
    { id: 'history', label: 'Order History', icon: History, show: true },
    { id: 'analytics', label: 'Sales Insights', icon: TrendingUp, show: ['admin', 'manager'].includes(userRole) },
  ];

  return (
    /* 🛡️ මෙන්න මේ පේළිය වෙනස් කළා: md:pl-72 ඇඩ් කරලා තියෙන්නේ */
    <div className="w-full mx-auto animate-in fade-in duration-500 pb-10">
      {/* <div className="p-6 animate-in fade-in duration-500"></div> */}
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-3xl font-serif text-textMain transition-colors duration-300 uppercase tracking-tight">
                Order <span className="italic text-primary transition-all duration-300">Console</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-textMain/50 transition-colors duration-300 mt-2 italic">Official Mehera International Registry</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-border transition-colors duration-300 overflow-x-auto w-full md:w-auto shadow-sm">
          {tabs.map((tab) => tab.show && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300'
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
              <div className="bg-card transition-colors duration-300 rounded-[2.5rem] border border-border transition-colors duration-300 shadow-sm flex flex-col h-full overflow-hidden">
                
                <div className="p-6 pb-4 border-b border-border bg-card transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4 text-left">
                    <div className="flex items-center gap-3">
                      <Package className="text-primary transition-all duration-300" size={20} />
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-textMain transition-colors duration-300">Live Inventory</h2>
                    </div>
                    <div className="bg-primary/10 transition-all duration-300 px-3 py-1 rounded-full">
                        <span className="text-[9px] font-black text-[#8a7b42] uppercase">{products.length} Items Syncing</span>
                    </div>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search cosmetics, shades or hair care..." 
                      className="w-full pl-10 pr-4 py-3 bg-card transition-colors duration-300 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all font-bold"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar bg-background transition-colors duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {products
                      .filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(product => (
                        <div key={product.product_id} className="transform scale-[0.95] origin-top-left transition-transform hover:scale-100">
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
            <div className="xl:w-[45%] h-[850px] overflow-y-auto custom-scrollbar bg-card transition-colors duration-300 rounded-[2.5rem] border border-border transition-colors duration-300 shadow-sm p-4">
              {userRole === 'sales_rep' ? (
                <AddOrder />
              ) : userRole === 'online_store_keeper' ? (
                <AddOnlineOrder />
              ) : (userRole === 'admin' || userRole === 'manager') ? (
                <AddOrder />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-textMain/50 transition-colors duration-300 p-10 text-center space-y-4">
                  <ShoppingCart size={48} className="opacity-10" />
                  <p className="text-xs font-black uppercase tracking-widest">Unauthorized Registry Access</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-card transition-colors duration-300 rounded-[3rem] border border-border shadow-sm p-4 animate-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'history' && <ViewOrders />}
          </div>
        )}
      </div>

      {/* --- VARIATION SELECTION MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-card transition-colors duration-300 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 space-y-8 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-serif italic text-textMain transition-colors duration-300 leading-tight">{selectedProduct.product_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-[2px] bg-primary transition-all duration-300"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 transition-colors duration-300">Available Shades / Variants</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant.variant_id}
                    onClick={() => handleAddToCart(selectedProduct, variant)}
                    className="flex justify-between items-center p-6 bg-card transition-colors duration-300 hover:bg-primary/10 transition-all duration-300 border border-border transition-colors duration-300 hover:border-primary/30 transition-all duration-300 rounded-3xl transition-all group w-full"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-[12px] uppercase tracking-wider text-textMain transition-colors duration-300 group-hover:text-primary transition-all duration-300">
                        {variant.variant_name}
                      </span>
                      <span className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold mt-1">
                        INSTOCK: {variant.stock_count || 'Check Sync'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="font-serif italic text-xl text-textMain transition-colors duration-300">
                        Rs. {Number(variant.price).toLocaleString()}
                      </span>
                      <div className="p-3 bg-card transition-colors duration-300 rounded-xl shadow-sm group-hover:bg-black group-hover:text-primary transition-all duration-300 transition-all transform group-hover:scale-110">
                        <PlusCircle size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-textMain/50 transition-colors duration-300 hover:text-red-500 transition-colors"
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