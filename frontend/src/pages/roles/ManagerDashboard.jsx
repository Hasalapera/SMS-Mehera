// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   BarChart3, 
//   Users, 
//   FileText, 
//   MapPin, 
//   LogOut, 
//   PieChart, 
//   Bell 
// } from 'lucide-react';

// const ManagerDashboard = () => {
//   const navigate = useNavigate();
  
//   const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Regional Manager' };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <div className="flex min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300 font-sans">
      
//       {/* Sidebar - Manager Menu */}
//       <div className="w-64 bg-card transition-all duration-300 border-r border-border transition-colors duration-300 p-6 flex flex-col">
//         <div className="mb-10">
//           <h2 className="text-2xl font-serif tracking-widest text-white leading-none">Mehera</h2>
//           <p className="text-[10px] text-primary transition-all duration-300 tracking-[0.2em] uppercase mt-1">Managerial Hub</p>
//         </div>

//         <nav className="flex-1 space-y-4">
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-primary/10 transition-all duration-300 text-primary transition-all duration-300 border border-primary/20 transition-all duration-300 font-medium">
//             <BarChart3 size={20} /> Regional Overview
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <Users size={20} /> Team Performance
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <FileText size={20} /> Sales Reports
//           </button>
//           <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-card/5 transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-white">
//             <MapPin size={20} /> Route Planning
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
//             <h1 className="text-3xl font-medium">Manager Dashboard</h1>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Welcome back, <span className="text-primary transition-all duration-300 font-medium">{user.full_name}</span>. Here is your region's update.</p>
//           </div>
//           <button className="relative p-2 bg-card transition-all duration-300 border border-border transition-colors duration-300 rounded-full text-textMain/50 transition-colors duration-300 hover:text-white">
//             <Bell size={20} />
//             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>
//         </header>

//         {/* Management Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-2xl border border-border transition-colors duration-300">
//             <div className="flex justify-between items-start mb-4">
//               <PieChart className="text-primary transition-all duration-300" size={24} />
//               <span className="text-green-500 text-xs font-bold">+12%</span>
//             </div>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Monthly Regional Target</p>
//             <h3 className="text-2xl font-bold mt-1">LKR 1.2M / 2M</h3>
//           </div>
          
//           <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-2xl border border-border transition-colors duration-300">
//             <div className="flex justify-between items-start mb-4">
//               <Users className="text-primary transition-all duration-300" size={24} />
//             </div>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Active Sales Reps</p>
//             <h3 className="text-2xl font-bold mt-1">08 Members</h3>
//           </div>

//           <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-2xl border border-border transition-colors duration-300">
//             <div className="flex justify-between items-start mb-4">
//               <FileText className="text-primary transition-all duration-300" size={24} />
//             </div>
//             <p className="text-textMain/50 transition-colors duration-300 text-sm">Pending Approvals</p>
//             <h3 className="text-2xl font-bold mt-1 text-orange-400">15 Orders</h3>
//           </div>
//         </div>

//         {/* Team Performance Table Section */}
//         <div className="bg-card transition-all duration-300 rounded-2xl border border-border transition-colors duration-300 p-6">
//           <h2 className="text-xl font-medium mb-6">Team Performance (This Month)</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead>
//                 <tr className="text-textMain/50 transition-colors duration-300 border-b border-border transition-colors duration-300">
//                   <th className="pb-4 font-medium">Sales Representative</th>
//                   <th className="pb-4 font-medium">Orders</th>
//                   <th className="pb-4 font-medium">Revenue</th>
//                   <th className="pb-4 font-medium">Efficiency</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-800">
//                 {[
//                   { name: "Hasala Shehan", orders: 45, rev: "LKR 145,000", eff: "92%" },
//                   { name: "Navodya Perera", orders: 38, rev: "LKR 112,000", eff: "85%" },
//                   { name: "Gihan Madushanka", orders: 30, rev: "LKR 98,000", eff: "78%" }
//                 ].map((rep, idx) => (
//                   <tr key={idx} className="hover:bg-card/5 transition-colors duration-300 group">
//                     <td className="py-4 text-gray-200">{rep.name}</td>
//                     <td className="py-4 text-textMain/50 transition-colors duration-300">{rep.orders}</td>
//                     <td className="py-4 font-medium text-primary transition-all duration-300">{rep.rev}</td>
//                     <td className="py-4 text-green-400">{rep.eff}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;