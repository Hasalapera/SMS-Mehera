import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, replace } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Package, Inbox, Menu } from 'lucide-react';
import SideBar from './SideBar';
import Navbar from './Navbar';
import { useAuth } from '../pages/context/AuthContext';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      }else if(user.is_default_password){
        navigate('/change-password', { replace: true, state: { userId: user.user_id } });
      }
    }
  }, [loading, user, navigate]);

  if(loading) {
    return(
      <div className="min-h-screen flex items-center justify-center bg-background transition-all duration-500 ease-in-out">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const userRole = user?.role;

  const getDynamicLogo = () => {
    // This is a simplified version. A more robust solution would involve a shared context for settings.
    return isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png";
  };

  if (!user) return null;
  // 1. roles should show side bar (admin, manager)
  const isSidebarRole = ['admin', 'manager'].includes(userRole);

  return (
    <div className="flex-1 min-h-screen bg-background transition-all duration-500 ease-in-out">
      {isSidebarRole ? (
        // Sidebar Layout (Admin / Manager)
        <>
          {/* Mobile Header for Admin/Manager */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-6 h-20">
            <div onClick={() => navigate('/home')} className="cursor-pointer">
                <img src={getDynamicLogo()} alt="Logo" className="h-8"/>
            </div>
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-textMain">
              <Menu size={28} />
            </button>
          </div>

          <SideBar
            isSidebarCollapsed={isSidebarCollapsed} 
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
        />
          <main className={`transition-all duration-300 ease-in-out pt-20 md:pt-0 ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}>
            {/* helps to prevent the sidebar from covering the content on a mobile screen. */}
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </>
      ) : (
        // Horizontal Layout (Sales Rep / Store Keeper)
        <div className="flex flex-col">
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