import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, replace } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Package, Inbox } from 'lucide-react';
import SideBar from './SideBar';
import Navbar from './Navbar';
import { useAuth } from '../pages/context/AuthContext';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b4a460]"></div>
      </div>
    );
  }
  
  const userRole = user?.role;

  if (!user) return null;
  // 1. Sidebar පෙන්විය යුතු Roles (Admin සහ Manager)
  const isSidebarRole = ['admin', 'manager'].includes(userRole);

  // // User ලොග් වෙලා නැත්නම් Login එකට යවනවා
  //   <Navigate to="/login" />;

  return (
    <div className="flex-1 min-h-screen bg-[#F9F9F9]">
      {isSidebarRole ? (
        // Sidebar Layout (Admin / Manager)
        <>
          <div className="flex">
            <SideBar
              isSidebarCollapsed={isSidebarCollapsed} 
              setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
          <main className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
            {/* Mobile Screen එකකදී Sidebar එක content එක වහන්නේ නැති වෙන්න මේ padding එක උදව් වෙනවා */}
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
        </>
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