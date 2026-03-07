import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, ShoppingCart, User, Package, Plus, Trash2, 
  CheckCircle2, UserPlus
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const AddOrder = () => {
  const [cusSearch, setCusSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [prodSearch, setProdSearch] = useState('');

  const dummyProducts = [
    { product_id: 1, category: 'SHAMPOO 250ML', price: 1200 },
    { product_id: 2, category: 'CONDITIONER 200ML', price: 1500 },
    { product_id: 3, category: 'HAIR COLOR - BLACK', price: 850 },
    { product_id: 4, category: 'FACE WASH 100ML', price: 600 },
  ];

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product_id === product.product_id);
      if (exists) return prev.map(item => item.product_id === product.product_id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.category} Added`);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans">
      <Toaster position="top-right" />
      
      {/* 🔴 NEW HEADER - MATCHING SUPPORT PAGE STYLE */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Left Side: Icon & Title */}
          <div className="flex items-center gap-5">
            {/* Icon Box exactly like Support Page */}
            <div className="bg-[#b4a460] p-3.5 rounded-2xl shadow-lg shadow-[#b4a460]/20 flex items-center justify-center">
              <ShoppingCart size={28} className="text-black" strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight uppercase leading-none flex items-center gap-2">
                Create <span className="text-[#b4a460]">New Order</span>
              </h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2.5 ml-1">
                Mehera International <span className="text-[#b4a460]/60 mx-2">|</span> Sales Management Center
              </p>
            </div>
          </div>

          {/* Right Side: Action Button */}
          <Link 
            to="/add-customer" 
            className="group flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-[#b4a460] px-6 py-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
          >
            <div className="bg-gray-50 group-hover:bg-[#b4a460]/10 p-2 rounded-xl transition-colors">
              <UserPlus size={20} className="text-gray-400 group-hover:text-[#b4a460]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black">
              Add New Customer
            </span>
          </Link>
        </div>
        
        {/* Decorative Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-gray-100 via-gray-200 to-transparent mt-8"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SECTIONS */}
        <div className="lg:col-span-8 space-y-4"> 
          
          {/* STEP 1: PARTNER SEARCH */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
            <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
              <User size={18}/> Step 1: Partner Details
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b4a460]" size={20}/>
              <input 
                type="text" 
                placeholder="Search Saloon or Owner..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#b4a460]/20 outline-none font-bold text-sm"
                value={cusSearch} 
                onChange={(e) => setCusSearch(e.target.value)}
              />
            </div>
          </div>

          {/* STEP 2: PRODUCT SELECTION */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-5 gap-3">
                <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <Package size={20}/> Step 2: Select Products
                </h2>
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  className="bg-gray-50 px-4 py-1.5 rounded-lg text-[10px] font-bold outline-none border focus:border-[#b4a460]/20" 
                  onChange={(e) => setProdSearch(e.target.value)} 
                />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {dummyProducts.filter(p => p.category.toLowerCase().includes(prodSearch.toLowerCase())).map(p => (
                  <div 
                    key={p.product_id} 
                    onClick={() => addToCart(p)} 
                    className="p-4 bg-white rounded-xl border-2 border-gray-100 flex justify-between items-center hover:border-[#b4a460] hover:shadow-md cursor-pointer transition-all"
                  >
                    <div>
                      <p className="font-black text-[12px] uppercase text-gray-800">{p.category}</p>
                      <p className="text-[11px] font-black text-[#b4a460] mt-1">Rs. {p.price.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#b4a460]"><Plus size={18}/></div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-5 bg-gray-50/50 border-b flex justify-between items-center gap-2">
                <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-[#b4a460]">Order Summary</h3>
                <ShoppingCart size={22} className="text-[#b4a460]"/>
            </div>
            
            <div className="p-6 space-y-5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center py-10 opacity-10">
                  <ShoppingCart size={45}/>
                  <p className="text-[12px] font-black uppercase mt-2">Empty Cart</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13px] text-black uppercase tracking-tight truncate">{item.category}</p>
                      <p className="text-[12px] text-[#b4a460] font-black mt-1">
                        Rs. {item.price.toLocaleString()} <span className="text-gray-300 mx-1">x</span> {item.qty}
                      </p>
                    </div>
                    <button 
                      onClick={() => setCart(c => c.filter(i => i.product_id !== item.product_id))} 
                      className="text-gray-300 hover:text-red-500 p-1"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* TOTAL PAYABLE SECTION */}
            <div className="p-4 bg-black text-white rounded-t-[2.5rem]">
               <div className="flex justify-between items-center mb-3 px-2 gap-3">
                  <div>
                    <span className="text-[10px] font-black text-[#b4a460] uppercase tracking-[0.2em] block">Total Amount</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase">Net Payable</span>
                  </div>
                  <span className="text-2xl font-black">Rs. {totalAmount.toLocaleString()}</span>
               </div>
               
               <button 
                 className="w-full py-4 bg-[#b4a460] text-black rounded-xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-lg hover:bg-white flex items-center justify-center gap-3 active:scale-95"
               >
                 <CheckCircle2 size={22} strokeWidth={3}/> Complete Order
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;