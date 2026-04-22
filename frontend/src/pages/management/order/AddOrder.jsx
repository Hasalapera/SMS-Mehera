// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, User, Package, Plus, Minus, Trash2, 
//   CheckCircle2 
// } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';


// const AddOrder = () => {
//   const [cusSearch, setCusSearch] = useState('');
//   const [cart, setCart] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const { token } = useAuth(); 



//   // --- දත්ත කියවීමේ ප්‍රධාන FUNCTION එක ---
//   const loadCartData = () => {
//     try {
//       const savedData = localStorage.getItem("active_order_cart");
//       console.log("AddOrder පේජ් එක දත්ත කියවනවා...", savedData);
      
//       if (savedData) {
//         setCart(JSON.parse(savedData));
//       } else {
//         setCart([]);
//       }
//     } catch (error) {
//       console.error("දත්ත කියවීමේදී දෝෂයක්:", error);
//     }
//   };

//   // 1. පේජ් එක මුලින්ම පෙන්වන විට
//   useEffect(() => {
//     // LocalStorage එකේ අපි Home එකේදී save කරපු නමම පාවිච්චි කරන්න
//   const savedCart = localStorage.getItem("active_order_cart");
//   if (savedCart) {
//     setCart(JSON.parse(savedCart));
//   }
//   }, []);

//   // 2. Navigation එක හරහා (Refresh නොවී) එන විට දත්ත අලුත් කිරීම
//   // පේජ් එකට focus එක එන හැම වෙලාවෙම මේක වැඩ කරයි
//   useEffect(() => {
//     window.addEventListener('focus', loadCartData);
//     return () => window.removeEventListener('focus', loadCartData);
//   }, []);

//   // 3. Cart එක ඇතුළේ වෙනස්කම් කළොත් සේව් කිරීම
//   useEffect(() => {
//     if (cart.length > 0) {
//       localStorage.setItem("active_order_cart", JSON.stringify(cart));
//     }
//   }, [cart]);

//   const increaseQty = (productId) => {
//     setCart(prev => prev.map(item => 
//       item.product_id === productId ? { ...item, qty: item.qty + 1 } : item
//     ));
//   };

//   const decreaseQty = (productId) => {
//     setCart(prev => prev.map(item => 
//       item.product_id === productId ? { ...item, qty: Math.max(1, item.qty - 1) } : item
//     ));
//   };

//   const removeItemCompletely = (productId) => {
//     const updatedCart = cart.filter(item => item.product_id !== productId);
//     setCart(updatedCart);
//     localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
//     toast.error("Product removed");
//   };

//   //const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
//   const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.qty || 0)), 0);


//   //search customers
//   const handleCustomerSearch = async (query) => {
//     setCusSearch(query);
//     setSelectedCustomer(null); // අලුතින් ටයිප් කරනකොට පරණ කෙනා අයින් කරන්න

//     if (query.length > 1) { 
//       setIsSearching(true);
//       try {
//         const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
//         const res = await axios.get(`http://localhost:5001/api/customers/search?q=${query}`, config);
//         setSuggestions(res.data);
//       } catch (err) {
//         console.error("Search failed", err);
//       } finally {
//         setIsSearching(false);
//       }
//     } else {
//       setSuggestions([]);
//     }
//   };

//   //place oder button function
//   const handlePlaceOrder = async () => {
//   if (!selectedCustomer) return toast.error("Please select a customer!");
//   if (cart.length === 0) return toast.error("Your cart is empty!");

//   try {
//     const orderData = {
//       customer_id: selectedCustomer.customer_id, // uuid එක
//       customer_name: selectedCustomer.saloon_name, // 👈 name pass here 
//       // shipping_address: `${selectedCustomer.address}, ${selectedCustomer.city}`, // 👈 adress pass here 
//       shipping_address: `${selectedCustomer.lane1 || ''}, ${selectedCustomer.district || ''}`,
//       phone: selectedCustomer.phone1,
//       total_amount: totalAmount,
//       items: cart.map(item => ({
//       product_id: item.product_id,
//       qty: item.qty,
//       price: item.price
//       })) 
//     };

//     const config = { headers: { Authorization: `Bearer ${token}` } };
//     const res = await axios.post('http://localhost:5001/api/orders/place', orderData, config);

//     if (res.data.success) {
//       toast.success("Order Placed Successfully!");
//       localStorage.removeItem("active_order_cart"); // Cart එක clear කිරීම
//       setCart([]);
//       // මෙතනදී Order History එකට navigate කරන්න පුළුවන්
//     }
//   } catch (err) {
//     toast.error("Something went wrong!");
//   }
// };

//   return (
//     <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans">
//       <Toaster position="top-right" />
      
//       {/* HEADER */}
//       <div className="max-w-7xl mx-auto mb-8">
//         <div className="flex items-center gap-5">
//           <div className="bg-[#b4a460] p-3.5 rounded-2xl shadow-lg flex items-center justify-center text-black">
//             <ShoppingCart size={28} strokeWidth={2.5} />
//           </div>
//           <h1 className="text-3xl font-black text-black tracking-tight uppercase">
//             Create <span className="text-[#b4a460]">New Order</span>
//           </h1>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
//         <div className="lg:col-span-8 space-y-4"> 
          
          
//           {/* STEP 1: PARTNER DETAILS */}
// <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative">
//   <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
//     <User size={18}/> Step 1: Partner Details
//   </h2>
  
//   <div className="relative">
//     <input 
//       type="text" 
//       placeholder="Type Saloon or Owner Name..."
//       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all"
//       value={cusSearch} 
//       onChange={(e) => handleCustomerSearch(e.target.value)} 
//     />
//   </div>

//   {/* සර්ච් කරනකොට එන නම පෙන්වන Dropdown එක */}
//   {suggestions.length > 0 && !selectedCustomer && (
//     <div className="absolute z-50 w-[calc(100%-3rem)] bg-white shadow-2xl rounded-2xl mt-1 border border-gray-100 overflow-hidden">
//       {suggestions.map((c) => (
//         <div 
//           key={c.id} 
//           className="px-6 py-4 hover:bg-[#b4a460] hover:text-white cursor-pointer transition-colors border-b border-gray-50 last:border-0"
//           onClick={() => {
//             setSelectedCustomer(c); // කෙනෙක්ව සිලෙක්ට් කළාම එයාගේ විස්තර save වෙනවා
//             setCusSearch(c.saloon_name); // Input එකේ ඒ නම පේනවා
//             setSuggestions([]); // Dropdown එක වැහෙනවා
//           }}
//         >
//           <p className="font-black text-sm uppercase">{c.saloon_name}</p>
//           <p className="text-[10px] opacity-80 font-bold">{c.owner_name} | {c.phone1}</p>
//         </div>
//       ))}
//     </div>
//   )}

//   {/* කෙනෙක්ව සිලෙක්ට් කළාට පස්සේ එයාගේ විස්තර පෙන්වන Card එක */}
//   {selectedCustomer && (
//     <div className="mt-5 p-5 bg-[#b4a460]/10 rounded-[1.5rem] border-2 border-[#b4a460]/20 grid grid-cols-2 md:grid-cols-4 gap-4">
//       <div>
//         <p className="text-[9px] font-black uppercase text-[#b4a460]">Owner</p>
//         <p className="text-sm font-bold text-black">{selectedCustomer.owner_name}</p>
//       </div>
//       <div>
//         <p className="text-[9px] font-black uppercase text-[#b4a460]">Phone</p>
//         <p className="text-sm font-bold text-black">{selectedCustomer.phone1}</p>
//       </div>
//       <div>
//         <p className="text-[9px] font-black uppercase text-[#b4a460]">District</p>
//         <p className="text-sm font-bold text-black uppercase">{selectedCustomer.district}</p>
//       </div>
//       <button 
//         onClick={() => { setSelectedCustomer(null); setCusSearch(''); }}
//         className="text-[10px] font-black text-red-500 uppercase underline"
//       >
//         Change
//       </button>
//     </div>
//   )}
// </div>

//           {/* STEP 2: SELECTED PRODUCTS */}
//           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 min-h-[300px]">
//              <h2 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
//                <Package size={20}/> Step 2: Selected Products
//              </h2>
             
//              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {cart && cart.length > 0 ? (
//                   cart.map((item) => (
//                     <div key={item.product_id} className="p-5 bg-white rounded-[1.5rem] border-2 border-[#b4a460]/10 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
//                       <div className="flex-1">
//                         <p className="font-black text-[13px] uppercase text-gray-800 leading-tight">
//                           {item.name}
//                         </p>
//                         <p className="text-[11px] font-black text-[#b4a460] mt-1.5">
//   Rs. {(Number(item.price) || 0).toLocaleString()}
// </p>
//                       </div>

//                       <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
//                         <button onClick={() => removeItemCompletely(item.product_id)} className="p-1.5 hover:bg-red-50 text-red-400 transition-all rounded-lg">
//                           <Trash2 size={16} strokeWidth={2.5}/>
//                         </button>
//                         <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>
//                         <button onClick={() => decreaseQty(item.product_id)} className="p-1.5 hover:bg-white text-gray-400 transition-all rounded-lg">
//                           <Minus size={16} strokeWidth={3}/>
//                         </button>
//                         <span className="px-2 text-[14px] font-black text-black min-w-[24px] text-center">{item.qty}</span>
//                         <button onClick={() => increaseQty(item.product_id)} className="p-1.5 hover:bg-white text-[#b4a460] transition-all rounded-lg">
//                           <Plus size={16} strokeWidth={3}/>
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center">
//                     <Package size={40} className="text-gray-200 mb-3"/>
//                     <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No products added from home</p>
//                   </div>
//                 )}
//              </div>
//           </div>
//         </div>

//         {/* ORDER SUMMARY */}
//         <div className="lg:col-span-4">
//           <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-6 overflow-hidden">
//             <div className="p-5 bg-gray-50/50 border-b flex justify-between items-center">
//                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#b4a460]">Summary</h3>
//                 <ShoppingCart size={20} className="text-[#b4a460]"/>
//             </div>
            
//             <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
//               {cart.map(item => (
//                 <div key={item.product_id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
//                   <div className="flex-1 truncate mr-2">
//                     <p className="font-black text-[11px] text-black uppercase truncate">{item.name}</p>
//                     <p className="text-[10px] text-gray-400 font-bold">
//   Qty: {item.qty} x {(Number(item?.price) || 0).toLocaleString()}
// </p>
//                   </div>
//                   <div className="font-black text-[12px] text-black">
//                     {(item.price * item.qty).toLocaleString()}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="p-5 bg-black text-white rounded-t-[2.5rem]">
//                <div className="flex justify-between items-center mb-4 px-2">
//                  <span className="text-[10px] font-black text-[#b4a460] uppercase tracking-widest">Total Amount</span>
//                  <span className="text-2xl font-black">Rs. {totalAmount.toLocaleString()}</span>
//                </div>
              
//               <button 
//                onClick={handlePlaceOrder} 
//               className="w-full py-4 bg-[#b4a460] text-black rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3"
//                >
//               <CheckCircle2 size={20} strokeWidth={3}/> Place Order
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddOrder;

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Package, Plus, Minus, Trash2, 
  CheckCircle2, Search, ArrowRight, UserCheck, ClipboardList
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AddOrder = () => {
  const [cusSearch, setCusSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { token } = useAuth(); 
  const [discount, setDiscount] = useState(0);

  // --- දත්ත කියවීමේ ප්‍රධාන FUNCTION එක ---
  const loadCartData = () => {
    try {
      const savedData = localStorage.getItem("active_order_cart");
      if (savedData) {
        setCart(JSON.parse(savedData));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("දත්ත කියවීමේදී දෝෂයක්:", error);
    }
  };

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    window.addEventListener('focus', loadCartData);
    return () => window.removeEventListener('focus', loadCartData);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("active_order_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const increaseQty = (cartItemId) => {
  setCart(prev => {
    const updatedCart = prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item
    );
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    return updatedCart;
  });
};

const decreaseQty = (cartItemId) => {
  setCart(prev => {
    const updatedCart = prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, qty: Math.max(1, item.qty - 1) } : item
    );
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    return updatedCart;
  });
};

const removeItemCompletely = (cartItemId) => {
  const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
  setCart(updatedCart);
  localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
  toast.error("Product removed from queue");
};

  const totalAmount = cart.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.qty) || 0;
    return sum + (itemPrice * itemQty);
  }, 0);

  const finalPayable = Math.max(0, totalAmount - (Number(discount) || 0));

  const handleCustomerSearch = async (query) => {
    setCusSearch(query);
    setSelectedCustomer(null);

    if (query.length > 1) { 
      setIsSearching(true);
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`http://localhost:5001/api/customers/search?q=${query}`, config);
        setSuggestions(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handlePlaceOrder = async () => {
  if (!selectedCustomer) return toast.error("Please select a partner!");
  if (cart.length === 0) return toast.error("Selection queue is empty!");

  try {
    // Discount එක % වලින් නම් calculate කරන්න
    const discountPercentage = Number(discount) || 0;
    const discountAmount = (totalAmount * discountPercentage) / 100;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const orderData = {
      customer_id: selectedCustomer.customer_id,
      customer_name: selectedCustomer.saloon_name,
      shipping_address: `${selectedCustomer.lane1 || ''}, ${selectedCustomer.district || ''}`,
      phone: selectedCustomer.phone1,
      
      // 👇 මේවා තමයි database එකට යන්නේ
      subtotal: totalAmount,              // මුලු එකතුව (discount නැතුව)
      discount_percentage: discountPercentage, // % එක
      discount_amount: discountAmount,    // LKR amount එක
      total_amount: finalAmount,          // අවසාන payable එක
      
      items: cart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id, 
        qty: item.qty,
        price: item.price
      })) 
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.post('http://localhost:5001/api/orders/place', orderData, config);

    if (res.data.success) {
      toast.success("Order Placed Successfully!");
      localStorage.removeItem("active_order_cart");
      setCart([]);
      setSelectedCustomer(null);
      setCusSearch('');
      setDiscount(0); // 👈 discount reset කරන්න
    }
  } catch (err) {
    console.error("Order Error:", err);
    toast.error("Something went wrong!");
  }
};

  return (
    <div className="w-full bg-white p-2 text-left animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      <div className="space-y-6"> 
        <h1 className="text-2xl font-black text-black tracking-tight uppercase">
            Create <span className="text-[#b4a460]">New Order</span>
        </h1>
        
        {/* STEP 1: PARTNER DETAILS */}
        <div className="bg-[#f8f8f8] p-6 rounded-[2rem] border border-gray-100 relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-5 bg-[#b4a460] rounded-full"></div>
            <h2 className="text-[10px] font-black uppercase text-black tracking-[0.2em]">
              01. Partner Details
            </h2>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-gray-300 group-focus-within:text-[#b4a460] transition-colors" size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search Saloon or Owner..."
              className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all shadow-sm"
              value={cusSearch} 
              onChange={(e) => handleCustomerSearch(e.target.value)} 
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && !selectedCustomer && (
            <div className="absolute z-50 left-6 right-6 bg-white shadow-2xl rounded-2xl mt-2 border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {suggestions.map((c) => (
                <div 
                  key={c.customer_id} 
                  className="px-6 py-4 hover:bg-[#faf8f0] cursor-pointer transition-colors flex justify-between items-center group"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCusSearch(c.saloon_name);
                    setSuggestions([]);
                  }}
                >
                  <div>
                    <p className="font-black text-xs uppercase text-black group-hover:text-[#b4a460] transition-colors">{c.saloon_name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{c.owner_name} • {c.phone1}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#b4a460] transition-all" />
                </div>
              ))}
            </div>
          )}

          {/* Selected Customer Card */}
          {selectedCustomer && (
            <div className="mt-5 p-5 bg-white rounded-2xl border-2 border-[#b4a460]/10 flex justify-between items-center shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#b4a460]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-black uppercase">{selectedCustomer.saloon_name}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{selectedCustomer.district} • {selectedCustomer.phone1}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedCustomer(null); setCusSearch(''); }}
                className="p-2 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: QUEUE SELECTION */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-black rounded-full"></div>
              <h2 className="text-[10px] font-black uppercase text-black tracking-[0.2em]">
                02. Order Queue
              </h2>
            </div>
            <span className="text-[9px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-400 uppercase">
              {cart.length} Items
            </span>
          </div>
          
          <div className="space-y-3">
            {cart && cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.product_id} className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-[#b4a460]/30 transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-black text-[11px] uppercase text-black truncate group-hover:text-[#b4a460] transition-colors">
                      {item.name}
                    </p>
                    {item.variant_name && item.variant_name !== 'Standard' && (
                    <p className="text-[9px] text-[#b4a460] font-black uppercase mt-0.5">
                      {item.variant_name}
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    LKR {(Number(item.price) || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border border-gray-100">
                  <button onClick={() => decreaseQty(item.cartItemId)}>  {/* ✅ */}
                    <Minus size={14} strokeWidth={3}/>
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item.cartItemId)}>  {/* ✅ */}
                    <Plus size={14} strokeWidth={3}/>
                  </button>
                  <button onClick={() => removeItemCompletely(item.cartItemId)}>  {/* ✅ */}
                    <Trash2 size={14}/>
                  </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[2rem] flex flex-col items-center justify-center">
                <Package size={32} className="text-gray-100 mb-3"/>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Queue is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* --- UPDATED LIGHT THEME SUMMARY SECTION --- */}
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#b4a460]/10 shadow-xl shadow-[#b4a460]/5 relative overflow-hidden sticky top-6">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#b4a460]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10 flex flex-col space-y-5">
          {/* 01. Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[#b4a460]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b4a460]">
                Order Finalization
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Pricing Analysis
            </p>
          </div>

          {/* 02. Subtotal Display */}
          <div className="flex justify-between items-center px-1 pt-2 border-b border-gray-50 pb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Subtotal</span>
            <span className="text-sm font-black text-black">Rs. {totalAmount.toLocaleString()}</span>
          </div>

          {/* 03. Discount Percentage Input */}
          <div className="p-4 bg-[#f8f8f8] rounded-2xl border border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Rate</span>
              <span className="text-[10px] font-black text-[#b4a460]">% Percentage</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, e.target.value)))} // 0-100 අතර තියාගන්නවා
                placeholder="0"
                className="w-full bg-white border-none rounded-xl py-3 pl-4 pr-10 text-sm font-black outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all text-right shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#b4a460] text-sm">%</span>
            </div>
          </div>

          {/* 04. Final Payable (Calculation Updated for %) */}
          <div className="py-2 text-right">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Final Payable</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[10px] font-black text-[#b4a460]">Rs.</span>
              <span className="text-4xl font-black text-black tracking-tighter leading-none">
                {Math.max(0, totalAmount - (totalAmount * (Number(discount) || 0) / 100)).toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="inline-block mt-2 px-3 py-1 bg-[#b4a460]/10 rounded-lg">
                <p className="text-[9px] text-[#b4a460] font-black uppercase italic tracking-tighter">
                  {discount}% OFF Applied (-Rs. {(totalAmount * discount / 100).toLocaleString()})
                </p>
              </div>
            )}
          </div>

          {/* 05. Action Button */}
          <div className="pt-2">
            <button 
              onClick={handlePlaceOrder} 
              disabled={cart.length === 0 || !selectedCustomer}
              className="w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl group bg-black text-[#b4a460] border border-black shadow-black/10 hover:bg-[#b4a460] hover:text-white hover:border-[#b4a460] hover:scale-[1.02] active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-100 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={18} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-12 group-disabled:rotate-0" /> 
              Finalize Order
            </button>
          </div>

          {/* 06. Footer Branding */}
          <div className="flex items-center justify-center gap-3 opacity-20 pt-2">
            <div className="h-[1px] flex-1 bg-gray-400"></div>
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.4em]">Mehera Registry</p>
            <div className="h-[1px] flex-1 bg-gray-400"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddOrder;