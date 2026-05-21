// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Box, 
//   ClipboardList, 
//   Truck, 
//   AlertTriangle, 
//   LogOut, 
//   Search,
//   CheckCircle2
// } from 'lucide-react';

// const StoreKeeper = () => {
//   const navigate = useNavigate();
  
//   const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Store Keeper' };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <div className="flex min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300 font-sans">
      
//       {/* Sidebar - Store Menu */}
//       <div className="w-64 bg-card transition-all duration-300 border-r border-border transition-colors duration-300 p-6 flex flex-col">
//         <div className="mb-10">
//           <h2 className="text-2xl font-serif tracking-widest text-white leading-none">Mehera</h2>
//           <p className="text-[10px] text-primary transition-all duration-300 tracking-[0.2em] uppercase mt-1">Store Management</p>
//         </div>

//         <nav className="flex-1 space-y-4">
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-primary/10 transition-all duration-300 text-primary transition-all duration-300 border border-primary/20 transition-all duration-300 font-medium">
//             <ClipboardList size={20} /> Pending Orders
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <Box size={20} /> Inventory Stock
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <Truck size={20} /> Dispatched
//           </button>
//         </nav>

//         <button 
//           onClick={handleLogout}
//           className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
//         >
//           <LogOut size={20} /> Logout
//         </button>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         <header className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-medium">Store Overview</h1>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Welcome, <span className="text-primary transition-all duration-300 font-medium">{user.full_name}</span>. Ready for dispatch?</p>
//           </div>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300" size={18} />
//             <input 
//               type="text" 
//               placeholder="Search Order ID..." 
//               className="bg-card transition-all duration-300 border border-border transition-colors duration-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-all duration-300"
//             />
//           </div>
//         </header>

//         {/* Store Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-card transition-all duration-300 p-6 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-4">
//             <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
//               <ClipboardList size={28} />
//             </div>
//             <div>
//               <p className="text-textMain/50 transition-colors duration-300 text-xs uppercase tracking-wider font-semibold">To be Packed</p>
//               <h3 className="text-2xl font-bold">12 Orders</h3>
//             </div>
//           </div>
          
//           <div className="bg-card transition-all duration-300 p-6 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-4">
//             <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
//               <AlertTriangle size={28} />
//             </div>
//             <div>
//               <p className="text-textMain/50 transition-colors duration-300 text-xs uppercase tracking-wider font-semibold">Low Stock Items</p>
//               <h3 className="text-2xl font-bold">05 Products</h3>
//             </div>
//           </div>

//           <div className="bg-card transition-all duration-300 p-6 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-4">
//             <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
//               <CheckCircle2 size={28} />
//             </div>
//             <div>
//               <p className="text-textMain/50 transition-colors duration-300 text-xs uppercase tracking-wider font-semibold">Completed Today</p>
//               <h3 className="text-2xl font-bold">28 Dispatches</h3>
//             </div>
//           </div>
//         </div>

//         {/* Pending Packaging List */}
//         <div className="bg-card transition-all duration-300 rounded-2xl border border-border transition-colors duration-300 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-medium">Pending Shipments</h2>
//             <button className="text-primary transition-all duration-300 text-sm hover:underline">View All</button>
//           </div>
          
//           <div className="space-y-4">
//             {[
//               { id: "ORD-9921", customer: "Kasun Perera", items: "Gold Facial Kit x 2", status: "In-Queue" },
//               { id: "ORD-9925", customer: "Nilmini Silva", items: "Aloe Gel x 5, Serum x 1", status: "Packing" },
//               { id: "ORD-9928", customer: "Saman Kumara", items: "Night Cream x 1", status: "In-Queue" }
//             ].map((order, idx) => (
//               <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-border/50 transition-colors duration-300">
//                 <div className="flex gap-4">
//                   <div className="w-12 h-12 bg-primary/10 transition-all duration-300 rounded-lg flex items-center justify-center text-primary transition-all duration-300">
//                     <Box size={22} />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-200">{order.id}</h4>
//                     <p className="text-xs text-textMain/50 transition-colors duration-300">{order.items}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
//                     order.status === 'Packing' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
//                   }`}>
//                     {order.status}
//                   </span>
//                   <p className="text-xs text-textMain/50 transition-colors duration-300 mt-2">{order.customer}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoreKeeper;