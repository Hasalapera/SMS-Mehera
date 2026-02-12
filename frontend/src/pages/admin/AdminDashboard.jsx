import React, { useState } from 'react';
import SideBar from '../../components/SideBar'; 
import { 
  LayoutDashboard, Bell, ArrowUpRight, MoreVertical, 
  PlusCircle, SlidersHorizontal, Download, RefreshCw 
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Admin User' };

  const stats = [
    { title: "Total Sales", value: "536,254 LKR", change: "+ 238.28 LKR", color: "text-green-500" },
    { title: "Customers", value: "728", change: "+ 45 Customers", color: "text-green-500" },
    { title: "Orders", value: "448", change: "- 45 Orders", color: "text-red-500" },
  ];

  const performers = [
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "96,000 LKR", progress: 65 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "124,000 LKR", progress: 85 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "22,000 LKR", progress: 20 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "55,000 LKR", progress: 45 },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9F9F9] font-sans overflow-x-hidden text-black">
      
      {/* Sidebar Component එක සම්බන්ධ කිරීම */}
      <SideBar 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <LayoutDashboard size={18} className="text-[#b4a460]" /> <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#b4a460] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-white p-1 pr-4 border border-gray-200 rounded-xl shadow-sm">
              <img src="https://i.pravatar.cc/150?u=hasala" className="w-10 h-10 rounded-lg object-cover" alt="user" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-black leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Action Buttons Bar (Filter, Customize, Export) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <RefreshCw size={14} className="text-[#b4a460]" />
            Last updated Quick Book, 9 March 2026
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              <PlusCircle size={14} /> Customize widget
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 bg-[#b4a460] text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#9a8b50] transition-colors">
              <Download size={14} /> Export Backup File
            </button>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-gray-500">
                <span>{stat.title}</span>
                <select className="bg-gray-50 border-none rounded p-1 text-[10px] outline-none font-bold"><option>This month</option></select>
              </div>
              <h3 className="text-3xl font-bold text-black mb-1">{stat.value}</h3>
              <p className={`text-[10px] font-bold ${stat.color}`}>{stat.change} <span className="text-gray-400 font-normal">than last month</span></p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#b4a460] cursor-pointer">
                View Report <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Products Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-sm font-bold">Sales analytics</h4>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#b4a460]"></span> Hot Lead</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EFE185]"></span> Warm Lead</div>
                <select className="bg-gray-50 border-none rounded p-1 outline-none"><option>This week</option></select>
              </div>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px] h-64 flex items-end justify-between gap-2 border-b border-gray-100 relative pt-10 px-4">
                  {['29 Sep', '30 Sep', '31 Sep', '01 Nov', '02 Nov', '03 Nov', '04 Nov'].map((day, i) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                          <div className="w-10 bg-gray-50 rounded-lg h-40 relative overflow-hidden flex flex-col justify-end group-hover:bg-gray-100 transition-colors">
                              <div className="w-full bg-[#EFE185] rounded-t" style={{height: `${20 + (i*10)}%`}}></div>
                              <div className="w-full bg-[#b4a460]" style={{height: `${15 + (i*5)}%`}}></div>
                          </div>
                          <span className="text-[8px] text-gray-400 font-bold">{day}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Trending Products */}
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-sm font-bold text-black">Trending Products</h4>
              <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="space-y-6">
              {['Lip Stick', 'Foundation', 'Maskara', 'Soap Brow'].map((name, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-gray-100 shadow-inner"></div>
                    <div>
                      <p className="text-[11px] font-bold group-hover:text-[#b4a460] transition-colors">{name}</p>
                      <p className="text-[8px] text-gray-400 uppercase">Mehera Collection</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold">6,000 LKR</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] border border-gray-100 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-8 text-black">
            <h4 className="text-sm font-bold">Top performers for the Month</h4>
            <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
          </div>
          <div className="space-y-6">
            {performers.map((rep, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 text-left">
                  <img src={`https://i.pravatar.cc/150?u=${idx}`} className="w-10 h-10 rounded-full object-cover" alt="rep" />
                  <div>
                    <h5 className="text-[11px] font-bold text-black">{rep.name}</h5>
                    <p className="text-[9px] text-gray-400 leading-none">{rep.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-sm hidden sm:flex">
                   <div className="flex-1 h-6 bg-gray-50 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#EFE185] to-[#b4a460] opacity-80" style={{ width: `${rep.progress}%` }}></div>
                   </div>
                   <p className="text-[11px] font-bold text-black min-w-[70px] text-right">{rep.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;