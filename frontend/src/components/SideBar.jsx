import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  BarChart2, Settings, HelpCircle, LogOut, ChevronDown, 
  ChevronRight, Menu, Inbox, SlidersHorizontal, PlusCircle, 
  ChevronLeft, UserPlus, UserMinus, UserCog, List 
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';

// 1. Menu Configuration
const menuConfig = {
  admin: { canManageUsers: true, canAddProducts: true, canViewReports: true, canEditInventory: true },
  manager: { canManageUsers: false, canAddProducts: true, canViewReports: true, canEditInventory: true },
  sales_rep: { canManageUsers: false, canAddProducts: false, canViewReports: false, canEditInventory: false }
};

// 2. Reusable NavItem Component (Hover සහ Active highlights මෙතැන පාලනය වේ)
const NavItem = ({ to, icon: Icon, label, isCollapsed, badge, onClick }) => {
  // Sub-menu එකක් නැති සාමාන්‍ය Link එකක් නම්
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          flex items-center justify-between w-full p-2.5 rounded-lg transition-all duration-200 group
          ${isActive 
            ? 'bg-[#b4a460] text-black font-semibold shadow-lg' 
            : 'text-gray-400 hover:bg-white/10 hover:text-[#b4a460]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-sm">{label}</span>}
        </div>
        {badge && !isCollapsed && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#b4a460]/20">
            {badge}
          </span>
        )}
      </NavLink>
    );
  }

  // Sub-menu එකක් open කරන button එකක් නම්
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-2.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-[#b4a460] transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0" />
        {!isCollapsed && <span className="text-sm">{label}</span>}
      </div>
      {/* ඊතලය පෙන්වන්නේ collapsed නැතිනම් පමණි */}
      {!isCollapsed && onClick && label === "Users" && (onClick.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
    </button>
  );
};

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const [openSubMenu, setOpenSubMenu] = useState('user');
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : {};
  const userRole = user?.role || 'sales_rep';
  const permissions = menuConfig[userRole] || menuConfig.sales_rep;

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

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
        
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Menu</p>}
          <NavItem to={user.redirectPath || '/admin-dashboard'} icon={LayoutDashboard} label="Dashboard" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/inbox" icon={Inbox} label="Inbox" badge="10" isCollapsed={isSidebarCollapsed} />
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Management</p>}
          <NavItem to="/orders" icon={ShoppingCart} label="Orders" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/customers" icon={Users} label="Customers" isCollapsed={isSidebarCollapsed} />
          
          {permissions.canViewReports && (
            <NavItem to="/reports" icon={BarChart2} label="Reports" isCollapsed={isSidebarCollapsed} />
          )}
          
          {permissions.canManageUsers && (
            <div className="space-y-1">
              {/* User Management dropdown button */}
              <NavItem 
                icon={UserCog} 
                label="Users" 
                isCollapsed={isSidebarCollapsed} 
                onClick={() => setOpenSubMenu(openSubMenu === 'user' ? '' : 'user')}
              />
              
              {!isSidebarCollapsed && openSubMenu === 'user' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/addUser" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><UserPlus size={14} /> Add User</NavLink>
                  <NavLink to="/updateUser" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><UserCog size={14} /> Update User</NavLink>
                  <NavLink to="/delete-user" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-red-400 ${isActive ? 'text-red-400 font-bold' : 'text-gray-500'}`}><UserMinus size={14} /> Delete User</NavLink>
                  <NavLink to="/all-users" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-white ${isActive ? 'text-white font-bold' : 'text-gray-500'}`}><List size={14} /> Show All Users</NavLink>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Products</p>}
          <NavItem to="/inventory" icon={Package} label="Inventory" isCollapsed={isSidebarCollapsed} />
          {permissions.canAddProducts && (
            <NavItem to="/addProduct" icon={PlusCircle} label="Add Product" isCollapsed={isSidebarCollapsed} />
          )}
          <NavItem to="/categories" icon={SlidersHorizontal} label="Categories" isCollapsed={isSidebarCollapsed} />
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mt-4 mb-2 ml-2">Help</p>}
          <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/support" icon={HelpCircle} label="Support" isCollapsed={isSidebarCollapsed} />
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