import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Package, Plus, Minus, Trash2, 
  CheckCircle2 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const AddOrder = () => {
  const [cusSearch, setCusSearch] = useState('');
  const [cart, setCart] = useState([]);

  // --- දත්ත කියවීමේ ප්‍රධාන FUNCTION එක ---
  const loadCartData = () => {
    try {
      const savedData = localStorage.getItem("active_order_cart");
      console.log("AddOrder පේජ් එක දත්ත කියවනවා...", savedData);
      
      if (savedData) {
        setCart(JSON.parse(savedData));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("දත්ත කියවීමේදී දෝෂයක්:", error);
    }
  };

  // 1. පේජ් එක මුලින්ම පෙන්වන විට
  useEffect(() => {
    loadCartData();
  }, []);

  // 2. Navigation එක හරහා (Refresh නොවී) එන විට දත්ත අලුත් කිරීම
  // පේජ් එකට focus එක එන හැම වෙලාවෙම මේක වැඩ කරයි
  useEffect(() => {
    window.addEventListener('focus', loadCartData);
    return () => window.removeEventListener('focus', loadCartData);
  }, []);

  // 3. Cart එක ඇතුළේ වෙනස්කම් කළොත් සේව් කිරීම
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("active_order_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const increaseQty = (productId) => {
    setCart(prev => prev.map(item => 
      item.product_id === productId ? { ...item, qty: item.qty + 1 } : item
    ));
  };

  const decreaseQty = (productId) => {
    setCart(prev => prev.map(item => 
      item.product_id === productId ? { ...item, qty: Math.max(1, item.qty - 1) } : item
    ));
  };

  const removeItemCompletely = (productId) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    setCart(updatedCart);
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    toast.error("Product removed");
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-5">
          <div className="bg-[#b4a460] p-3.5 rounded-2xl shadow-lg flex items-center justify-center text-black">
            <ShoppingCart size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            Create <span className="text-[#b4a460]">New Order</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4"> 
          
          {/* STEP 1: PARTNER DETAILS */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
              <User size={18}/> Step 1: Partner Details
            </h2>
            <input 
              type="text" placeholder="Search Saloon or Owner..."
              className="w-full px-6 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all"
              value={cusSearch} onChange={(e) => setCusSearch(e.target.value)}
            />
          </div>

          {/* STEP 2: SELECTED PRODUCTS */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 min-h-[300px]">
             <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
               <Package size={20}/> Step 2: Selected Products
             </h2>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cart && cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.product_id} className="p-5 bg-white rounded-[1.5rem] border-2 border-[#b4a460]/10 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                      <div className="flex-1">
                        <p className="font-black text-[13px] uppercase text-gray-800 leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-black text-[#b4a460] mt-1.5">Rs. {item.price.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                        <button onClick={() => removeItemCompletely(item.product_id)} className="p-1.5 hover:bg-red-50 text-red-400 transition-all rounded-lg">
                          <Trash2 size={16} strokeWidth={2.5}/>
                        </button>
                        <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>
                        <button onClick={() => decreaseQty(item.product_id)} className="p-1.5 hover:bg-white text-gray-400 transition-all rounded-lg">
                          <Minus size={16} strokeWidth={3}/>
                        </button>
                        <span className="px-2 text-[14px] font-black text-black min-w-[24px] text-center">{item.qty}</span>
                        <button onClick={() => increaseQty(item.product_id)} className="p-1.5 hover:bg-white text-[#b4a460] transition-all rounded-lg">
                          <Plus size={16} strokeWidth={3}/>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center">
                    <Package size={40} className="text-gray-200 mb-3"/>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No products added from home</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-6 overflow-hidden">
            <div className="p-5 bg-gray-50/50 border-b flex justify-between items-center">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#b4a460]">Summary</h3>
                <ShoppingCart size={20} className="text-[#b4a460]"/>
            </div>
            
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 truncate mr-2">
                    <p className="font-black text-[11px] text-black uppercase truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Qty: {item.qty} x {item.price.toLocaleString()}</p>
                  </div>
                  <div className="font-black text-[12px] text-black">
                    {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-black text-white rounded-t-[2.5rem]">
               <div className="flex justify-between items-center mb-4 px-2">
                 <span className="text-[10px] font-black text-[#b4a460] uppercase tracking-widest">Total Amount</span>
                 <span className="text-2xl font-black">Rs. {totalAmount.toLocaleString()}</span>
               </div>
               <button className="w-full py-4 bg-[#b4a460] text-black rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3">
                 <CheckCircle2 size={20} strokeWidth={3}/> Place Order
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;