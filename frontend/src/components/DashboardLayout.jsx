import React, { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Package, Inbox } from 'lucide-react';
import SideBar from './SideBar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // LocalStorage එකෙන් user දත්ත ලබා ගැනීම
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user?.role;

  // 1. Sidebar පෙන්විය යුතු Roles (Admin සහ Manager)
  const isSidebarRole = ['admin', 'manager'].includes(userRole);

  // User ලොග් වෙලා නැත්නම් Login එකට යවනවා
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
    {isSidebarRole ? (
      // Sidebar Layout (Admin / Manager)
      <div className="flex">
        <SideBar
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    ) : (
      // Horizontal Layout (Sales Rep / Store Keeper)
      <div className="flex flex-col">
        {/* මෙතනට ඔයාගේ අලුත් Navbar එක දාන්න */}
        <Navbar /> 
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    )}
  </div>
  );
};

export default DashboardLayout;