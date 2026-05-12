// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Home, 
//   ShoppingBag, 
//   Users, 
//   History, 
//   LogOut, 
//   TrendingUp, 
//   CheckCircle 
// } from 'lucide-react';

// const SalesRepDashboard = () => {
//   const navigate = useNavigate();
  
//   const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Sales Rep' };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <div className="flex min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300 font-sans">
      
//       {/* Sidebar - Sales Rep Menu */}
//       <div className="w-64 bg-card transition-all duration-300 border-r border-border transition-colors duration-300 p-6 flex flex-col">
//         <div className="mb-10">
//           <h2 className="text-2xl font-serif tracking-widest text-white">Mehera</h2>
//           <p className="text-[10px] text-primary transition-all duration-300 tracking-widest uppercase">Sales Portal</p>
//         </div>

//         <nav className="flex-1 space-y-4">
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-primary/10 transition-all duration-300 text-primary transition-all duration-300 border border-primary/20 transition-all duration-300">
//             <Home size={20} /> Home
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <ShoppingBag size={20} /> New Order
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <Users size={20} /> My Customers
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <History size={20} /> Sale History
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
//             <h1 className="text-3xl font-medium">Welcome, <span className="text-primary transition-all duration-300">{user.full_name}</span></h1>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Have a productive sales day at Mehera!</p>
//           </div>
//         </header>

//         {/* Sales Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           <div className="bg-card transition-all duration-300 p-5 rounded-xl border border-border transition-colors duration-300">
//             <TrendingUp className="text-primary transition-all duration-300 mb-3" size={24} />
//             <p className="text-textMain/50 transition-colors duration-300 text-xs">Today's Sales</p>
//             <h3 className="text-xl font-bold">LKR 12,450.00</h3>
//           </div>
//           <div className="bg-card transition-all duration-300 p-5 rounded-xl border border-border transition-colors duration-300">
//             <CheckCircle className="text-green-500 mb-3" size={24} />
//             <p className="text-textMain/50 transition-colors duration-300 text-xs">Target Achievement</p>
//             <h3 className="text-xl font-bold">75%</h3>
//           </div>
//           <div className="bg-card transition-all duration-300 p-5 rounded-xl border border-border transition-colors duration-300">
//             <ShoppingBag className="text-blue-500 mb-3" size={24} />
//             <p className="text-textMain/50 transition-colors duration-300 text-xs">Orders Pending</p>
//             <h3 className="text-xl font-bold">04</h3>
//           </div>
//           <div className="bg-card transition-all duration-300 p-5 rounded-xl border border-border transition-colors duration-300">
//             <Users className="text-purple-500 mb-3" size={24} />
//             <p className="text-textMain/50 transition-colors duration-300 text-xs">New Leads</p>
//             <h3 className="text-xl font-bold">02</h3>
//           </div>
//         </div>

//         {/* Recent Activities Section */}
//         <div className="bg-card transition-all duration-300 rounded-2xl border border-border transition-colors duration-300 p-6">
//           <h2 className="text-xl font-medium mb-4">Recent Sales Activity</h2>
//           <div className="space-y-4">
//             {/* Sample Activity List */}
//             {[1, 2, 3].map((item) => (
//               <div key={item} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-border/50 transition-colors duration-300">
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 rounded-full bg-primary/20 transition-all duration-300 flex items-center justify-center text-primary transition-all duration-300">
//                     <ShoppingBag size={18} />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm text-gray-200">Order #MEH-00{item}</p>
//                     <p className="text-xs text-textMain/50 transition-colors duration-300">To: Customer Name {item}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-bold text-primary transition-all duration-300 text-sm">LKR 4,500.00</p>
//                   <p className="text-[10px] text-textMain/50 transition-colors duration-300">2 hours ago</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesRepDashboard;