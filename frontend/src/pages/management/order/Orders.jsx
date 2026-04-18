// import React, { useState } from 'react';
// import { 
//   ShoppingBag, PlusCircle, History, TrendingUp, 
//   Truck, ClipboardList, Filter 
// } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { Toaster } from 'react-hot-toast';
// import ViewOrders from './ViewOrders';

// // Import කරගන්න ඔයාගේ Order පේජ් ටික
// import AddOrder from './AddOrder';
// // import ViewOrders from './ViewOrders'; // පස්සේ හදාගන්න පුළුවන්

// const Orders = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState('create');
//   const userRole = user?.role;

//   // --- පර්මිෂන් ලොජික් එක ---
//   const canCreate = ['admin', 'sales_rep'].includes(userRole);
//   const canViewAll = ['admin', 'manager'].includes(userRole);
//   const canViewReports = ['admin', 'manager'].includes(userRole);

//   // ටැබ්ස් ව්‍යුහය
//   const tabs = [
//     { id: 'create', label: 'Create Order', icon: PlusCircle, show: canCreate },
//     { id: 'history', label: 'Order History', icon: History, show: true }, // හැමෝටම තමන්ගේ ඉතිහාසය බලන්න පුළුවන්
//     { id: 'tracking', label: 'Dispatch/Logistics', icon: Truck, show: true },
//     { id: 'analytics', label: 'Sales Insights', icon: TrendingUp, show: canViewReports },
//   ];

//   return (
//     <div className="min-h-screen bg-[#fdfdfb] p-6 md:p-10">
//       <Toaster position="top-right" />
      
//       {/* HEADER SECTION */}
//       <div className="max-w-7xl mx-auto mb-10 text-left flex justify-between items-end">
//         <div>
//             <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-1 flex bg-black"></div>
//                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b4a460]">
//                     Transaction Engine
//                 </span>
//             </div>
//             <h1 className="text-4xl font-serif text-black uppercase tracking-tight">
//                 Order <span className="italic text-[#b4a460]">Management</span>
//             </h1>
//         </div>
        
//         {/* Quick Summary Pill (Only for Admin/Manager) */}
//         {canViewReports && (
//             <div className="hidden md:flex gap-4">
//                 <div className="bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm">
//                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Today's Volume</p>
//                     <p className="text-lg font-black text-black">Rs. 142,500</p>
//                 </div>
//             </div>
//         )}
//       </div>

//       {/* TABS NAVIGATION */}
//       <div className="max-w-7xl mx-auto mb-8 overflow-x-auto">
//         <div className="flex gap-2 border-b border-gray-100 min-w-max pb-px">
//           {tabs.map((tab) => (
//             tab.show && (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
//                   activeTab === tab.id 
//                   ? 'text-black border-b-2 border-[#b4a460]' 
//                   : 'text-gray-300 hover:text-gray-500'
//                 }`}
//               >
//                 <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
//                 {tab.label}
//               </button>
//             )
//           ))}
//         </div>
//       </div>

//       {/* DYNAMIC CONTENT AREA */}
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm min-h-[600px] overflow-hidden">
          
//           {/* Active Tab Content */}
//           <div className="animate-in fade-in duration-500">
//             {activeTab === 'create' && <AddOrder />}
            
//             {activeTab === 'history' && (
//             <div className="p-10 text-left"> 
//               {/* මෙන්න මෙතනදී තමයි අලුත් Table එක පෙන්වන්නේ */}
//               <ViewOrders /> 
//           </div>
// )}

//             {activeTab === 'tracking' && (
//                <div className="py-32 text-center">
//                   <Truck className="mx-auto text-[#b4a460] mb-6 opacity-20" size={64} />
//                   <h3 className="text-xl font-serif italic text-gray-400">Logistics tracking coming soon</h3>
//                </div>
//             )}

//             {activeTab === 'analytics' && (
//                <div className="p-10">
//                   <h2 className="text-xs font-black uppercase tracking-widest text-[#b4a460] mb-8">Performance Metrics</h2>
//                   {/* Chart එකක් වගේ දෙයක් මෙතනට දාන්න පුළුවන් */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {[1, 2, 3].map(i => (
//                         <div key={i} className="h-32 bg-gray-50 rounded-[2rem] animate-pulse"></div>
//                     ))}
//                   </div>
//                </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Orders;


import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, PlusCircle, History, TrendingUp, 
  Truck, Search, Package, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// පවතින Components
import AddOrder from './AddOrder';
import ViewOrders from './ViewOrders';
import ProductCard from '../../../components/ProductCard'; // ඔයාගේ Product Card එක

const Orders = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = user?.role;

  // Inventory එක load කරගැනීම
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/products/getProducts');
        setProducts(res.data?.products || res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    if (activeTab === 'create') fetchProducts();
  }, [activeTab]);

  const tabs = [
    { id: 'create', label: 'Create Order', icon: PlusCircle, show: ['admin', 'sales_rep'].includes(userRole) },
    { id: 'history', label: 'Order History', icon: History, show: true },
    { id: 'analytics', label: 'Sales Insights', icon: TrendingUp, show: ['admin', 'manager'].includes(userRole) },
  ];

  const handleAddToCart = (product) => {
    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    
    // පළමු variant එකේ මිල හෝ ප්‍රධාන මිල ගන්න
    const unitPrice = product.variants && product.variants.length > 0 
      ? Number(product.variants[0].price) 
      : Number(product.price);

    const existingItemIndex = savedCart.findIndex(item => item.product_id === product.product_id);
    
    let updatedCart;
    if (existingItemIndex > -1) {
      // දැනටමත් තියෙනවා නම් qty විතරක් වැඩි කරනවා
      updatedCart = [...savedCart];
      updatedCart[existingItemIndex].qty += 1;
    } else {
      // අලුතින් ඇඩ් කරනවා
      updatedCart = [...savedCart, { 
        product_id: product.product_id, 
        name: product.product_name, 
        price: unitPrice, // Unit Price එක විතරක් සේව් කරන්න
        qty: 1 
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    
    // දකුණු පැත්තට දැනුම් දීම
    window.dispatchEvent(new Event('focus'));
    toast.success(`${product.product_name} updated in queue!`);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfb] p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-serif text-black uppercase tracking-tight">
                Order <span className="italic text-[#b4a460]">Console</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Registry & Inventory Integrated</p>
        </div>

        {/* TABS - Compact version */}
        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
          {tabs.map((tab) => tab.show && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
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
          /* ── SPLIT VIEW FOR CREATE ORDER ── */
          <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
            
            {/* ⬅️ LEFT PANEL: LIVE INVENTORY (60% Width on Desktop) */}
            <div className="xl:w-[55%] flex flex-col h-[850px]"> 
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
              
              {/* Fixed Header within the Container */}
              <div className="p-6 pb-4 border-b border-gray-50 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-[#b4a460]" size={20} />
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-black">Live Inventory</h2>
                  </div>
                  <div className="bg-[#b4a460]/10 px-3 py-1 rounded-full">
                      <span className="text-[9px] font-black text-[#8a7b42] uppercase">{products.length} Items Available</span>
                  </div>
                </div>

                {/* Search Bar - Fixed at top */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input 
                    type="text" 
                    placeholder="Quick search products..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all font-bold"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* 📜 SCROLLABLE PRODUCT AREA */}
              <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar bg-[#fcfcfc]">
                {/* මෙහිදී grid එක 2xl වලදී cards 3ක් පෙන්වන විදිහට හැදුවා. 
                  පැත්ත පටු නිසා cards එක උඩ එක වැටෙන්නේ නැති වෙන්න responsive columns දාලා තියෙන්නේ.
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {products
                    .filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(product => (
                      <div key={product.product_id} className="transform scale-[0.95] origin-top-left">
                        {/* ✅ මෙන්න මේ විදියට onAddToCart එක ඇඩ් කරන්න */}
                        <ProductCard 
                          product={product} 
                          onAddToCart={() => handleAddToCart(product)} 
                        />
                      </div>
                  ))}
                  
                  {/* Empty State */}
                  {products.filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <div className="col-span-full py-20 text-center opacity-30">
                          <Package size={48} className="mx-auto mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest">No matching items</p>
                      </div>
                  )}
                </div>
              </div>

            </div>
          </div>

            {/* ➡️ RIGHT PANEL: ADD ORDER CONSOLE (45% Width on Desktop) */}
            <div className="xl:w-[45%] h-[850px] overflow-y-auto no-scrollbar bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-2">
              <AddOrder />
            </div>

          </div>
        ) : (
          /* ── OTHER TABS (History etc) ── */
          <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm p-2">
            {activeTab === 'history' && <ViewOrders />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;