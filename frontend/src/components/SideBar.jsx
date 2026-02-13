import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  BarChart2, UserCheck, Settings, HelpCircle, 
  Search, LogOut, ChevronDown, ChevronRight, 
  Menu, Inbox, SlidersHorizontal, PlusCircle, 
  ChevronLeft, UserPlus, UserMinus, UserCog, List 
} from 'lucide-react';

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const [openSubMenu, setOpenSubMenu] = useState('user');
  
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  

  return (
    <aside className={`bg-[#141414] text-white flex flex-col p-5 transition-all duration-300 fixed h-full z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Logo Section */}
      <div className="mb-8 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-serif tracking-widest leading-none">Mehera</span>
            <span className="text-[8px] tracking-[0.2em] text-[#b4a460] uppercase mt-1">International (Pvt) Ltd</span>
          </div>
        )}
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-400 hover:text-white p-1 bg-[#242424] rounded">
          {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="relative mb-8 flex justify-center px-2">
        <div className={`relative flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10 bg-[#242424] rounded-xl' : 'w-full'}`}>
          <Search className={`text-gray-500 transition-all ${isSidebarCollapsed ? 'w-5 h-5' : 'absolute left-3 w-4 h-4'}`} />
          {!isSidebarCollapsed && (
            <input type="text" placeholder="Search" className="w-full bg-[#242424] rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none" />
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
        
        
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Menu</p>}
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[#b4a460] text-black font-semibold shadow-lg">
            <LayoutDashboard size={18} /> {!isSidebarCollapsed && "Dashboard"}
          </button>
          <button className="flex items-center justify-between w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><Inbox size={18} /> {!isSidebarCollapsed && "Inbox"}</div>
            {!isSidebarCollapsed && <span className="text-[#b4a460] text-[10px] font-bold">10</span>}
          </button>
        </div>

        
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Customers</p>}
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><ShoppingCart size={18} /> {!isSidebarCollapsed && "Orders"}</button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><Users size={18} /> {!isSidebarCollapsed && "Customer"}</button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><UserCheck size={18} /> {!isSidebarCollapsed && "Sales Representatives"}</button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><BarChart2 size={18} /> {!isSidebarCollapsed && "Reports"}</button>
          
          
          <div className="space-y-1">
            <button 
              onClick={() => setOpenSubMenu(openSubMenu === 'user' ? '' : 'user')}
              className="flex items-center justify-between w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"
            >
              <div className="flex items-center gap-3"><Users size={18} /> {!isSidebarCollapsed && "User Management"}</div>
              {!isSidebarCollapsed && (openSubMenu === 'user' ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </button>
            
            {!isSidebarCollapsed && openSubMenu === 'user' && (
              <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                
                {userRole === 'admin' && (
                  <>
                    <button className="flex items-center gap-2 w-full p-2 text-[11px] text-gray-500 hover:text-[#b4a460]"><UserPlus size={14} /> Add User</button>
                    <button className="flex items-center gap-2 w-full p-2 text-[11px] text-gray-500 hover:text-[#b4a460]"><UserCog size={14} /> Update User</button>
                    <button className="flex items-center gap-2 w-full p-2 text-[11px] text-gray-500 hover:text-red-400"><UserMinus size={14} /> Delete User</button>
                  </>
                )}
                
                <button className="flex items-center gap-2 w-full p-2 text-[11px] text-gray-500 hover:text-white"><List size={14} /> Show All Users</button>
              </div>
            )}
          </div>
        </div>

        
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Products</p>}
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
            <Package size={18} /> {!isSidebarCollapsed && "Inventory"}
          </button>
          
          {userRole === 'admin' && (
            <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5">
              <PlusCircle size={18} /> {!isSidebarCollapsed && "Add Product"}
            </button>
          )}
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5 text-left">
            <SlidersHorizontal size={18} /> {!isSidebarCollapsed && "Categories Management"}
          </button>
        </div>

        {/* 4. Help Category */}
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mt-4 mb-2 ml-2">Help</p>}
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><Settings size={18} /> {!isSidebarCollapsed && "Settings"}</button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/5"><HelpCircle size={18} /> {!isSidebarCollapsed && "Support & feedback"}</button>
        </div>
      </nav>

      {/* User Info Footer */}
      <div className={`mt-auto pt-6 border-t border-gray-800 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3 p-2 bg-[#1A1A1A] rounded-xl border border-gray-800 mb-4">
            <img src="https://i.pravatar.cc/150?u=hasala" className="w-8 h-8 rounded-lg" alt="profile" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate text-white">{user.full_name}</p>
              <p className="text-[9px] text-[#b4a460] uppercase truncate">{userRole}</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className={`flex items-center gap-3 w-full p-2 text-[11px] text-gray-500 hover:text-red-400 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} /> {!isSidebarCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
