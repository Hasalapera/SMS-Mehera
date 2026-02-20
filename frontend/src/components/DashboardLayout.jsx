import React, { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Package, Inbox } from 'lucide-react';
import SideBar from './SideBar';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // LocalStorage එකෙන් user දත්ත ලබා ගැනීම
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user?.role;

  // 1. Sidebar පෙන්විය යුතු Roles (Admin සහ Manager)
  const isSidebarRole = ['admin', 'manager'].includes(userRole);

  // --- Horizontal NavBar Component (Sales Rep & Store Keeper සඳහා) ---
  const HorizontalNavBar = () => (
    <nav className="bg-[#141414] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[1000] border-b border-gray-800">
      <div className="flex items-center gap-8">
        <div className="flex flex-col text-left">
          <span className="text-xl font-serif tracking-widest leading-none">Mehera</span>
          <span className="text-[8px] tracking-[0.2em] text-[#b4a460] uppercase mt-1">International</span>
        </div>
        
        <div className="flex items-center gap-6 ml-10">
          <NavLink to={`/${userRole}-dashboard`} className={({isActive}) => `flex items-center gap-2 text-xs uppercase tracking-wider transition-colors ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-400 hover:text-[#b4a460]'}`}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => `flex items-center gap-2 text-xs uppercase tracking-wider transition-colors ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-400 hover:text-[#b4a460]'}`}>
            <Users size={16} /> Customers
          </NavLink>
          <NavLink to="/inbox" className={({isActive}) => `flex items-center gap-2 text-xs uppercase tracking-wider transition-colors ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-400 hover:text-[#b4a460]'}`}>
            <Inbox size={16} /> Inbox
          </NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-2 hidden sm:block">
          <p className="text-[10px] font-bold text-white leading-none">{user?.full_name}</p>
          <p className="text-[8px] text-[#b4a460] uppercase tracking-tighter mt-1">{userRole}</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
          className="text-gray-400 hover:text-red-400 p-2 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );

  // User ලොග් වෙලා නැත්නම් Login එකට යවනවා
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {isSidebarRole ? (
        // --- Sidebar Layout (Admin / Manager) ---
        <div className="flex">
          <SideBar 
            isSidebarCollapsed={isSidebarCollapsed} 
            setIsSidebarCollapsed={setIsSidebarCollapsed} 
          />
          <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <header className="mb-6 flex justify-between items-center">
               <h1 className="text-xl font-serif text-gray-800 capitalize">{userRole} Control Panel</h1>
            </header>
            <Outlet />
          </main>
        </div>
      ) : (
        // --- Horizontal Layout (Sales Rep / Store Keeper) ---
        <div className="flex flex-col">
          <HorizontalNavBar />
          <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;