import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      <SideBar 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />

      <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Outlet /> {/* මෙතැනට තමයි Inbox, Reports වැනි පේජ් ලෝඩ් වෙන්නේ */}
      </main>
    </div>
  );
};

export default DashboardLayout;