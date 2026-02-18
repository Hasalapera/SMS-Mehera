import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  BarChart2, Settings, HelpCircle, LogOut, ChevronDown, 
  ChevronRight, Menu, Inbox, SlidersHorizontal, PlusCircle, 
  ChevronLeft, UserPlus, UserMinus, UserCog, List, FileText, 
  Download, UserCheck, ClipboardList, ShoppingBag
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';

const menuConfig = {
  admin: { canManageUsers: true, canAddProducts: true, canViewReports: true, canEditInventory: true },
  manager: { canManageUsers: false, canAddProducts: true, canViewReports: true, canEditInventory: true },
  sales_rep: { canManageUsers: false, canAddProducts: false, canViewReports: false, canEditInventory: false }
};

const NavItem = ({ to, icon: Icon, label, isCollapsed, badge, onClick, isOpen }) => {
  const commonClasses = `flex items-center justify-between w-full p-2.5 rounded-lg transition-all duration-200 group relative hover:z-[1000]`;
  
  const activeClasses = ({ isActive }) => `
    ${commonClasses}
    ${isActive ? 'bg-[#b4a460] text-black font-semibold shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-[#b4a460]'}
  `;

  const renderContent = () => (
    <>
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0" />
        {!isCollapsed && <span className="text-sm">{label}</span>}
      </div>
      
      {badge && !isCollapsed && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#b4a460]/20">{badge}</span>
      )}

      {!isCollapsed && onClick && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}

      {isCollapsed && (
        <div className="fixed left-[70px] px-3 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-md 
                        whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[9999]
                        shadow-2xl border border-gray-800 uppercase tracking-widest flex items-center translate-x-[-10px] group-hover:translate-x-0">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-b border-gray-800 rotate-45"></div>
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <NavLink to={to} className={activeClasses}>
        {renderContent()}
      </NavLink>
    );
  }

  return (
    <button onClick={onClick} className={`${commonClasses} text-gray-400 hover:bg-white/10 hover:text-[#b4a460]`}>
      {renderContent()}
    </button>
  );
};

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const [openSubMenu, setOpenSubMenu] = useState(''); 
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : {};
  const userRole = user?.role || 'sales_rep';
  const permissions = menuConfig[userRole] || menuConfig.sales_rep;

  const handleToggleSubMenu = (menu) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false); 
      setOpenSubMenu(menu); 
    } else {
      setOpenSubMenu(openSubMenu === menu ? '' : menu); 
    }
  };

  return (
    <aside className={`bg-[#141414] text-white flex flex-col p-5 transition-all duration-300 fixed h-full z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'} overflow-visible`}>
      
      <div className={`mb-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-1`}>
        {!isSidebarCollapsed && (
          <div className="flex flex-col text-left">
            <span className="text-xl font-serif tracking-widest leading-none">Mehera</span>
            <span className="text-[8px] tracking-[0.2em] text-[#b4a460] uppercase mt-1">International (Pvt) Ltd</span>
          </div>
        )}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="text-gray-400 hover:text-[#b4a460] p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200"
          title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
          {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1 overflow-x-visible">
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2 text-left">Menu</p>}
          <NavItem to={user.redirectPath || '/admin-dashboard'} icon={LayoutDashboard} label="Dashboard" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/inbox" icon={Inbox} label="Inbox" badge="10" isCollapsed={isSidebarCollapsed} />
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2 text-left">Management</p>}
          
          {/* Orders */}
          <div className="space-y-1">
            <NavItem icon={ShoppingCart} label="Orders" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('orders')} isOpen={openSubMenu === 'orders'} />
            {!isSidebarCollapsed && openSubMenu === 'orders' && (
              <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                <NavLink to="/orders/new" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><PlusCircle size={14} /> New Order</NavLink>
                <NavLink to="/orders/history" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><ClipboardList size={14} /> Order History</NavLink>
              </div>
            )}
          </div>

          {/* Customers */}
          <div className="space-y-1">
            <NavItem icon={Users} label="Customers" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('customers')} isOpen={openSubMenu === 'customers'} />
            {!isSidebarCollapsed && openSubMenu === 'customers' && (
              <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                <NavLink to="/add-customer" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><UserPlus size={14} /> Add Customer</NavLink>
                <NavLink to="/customers" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><List size={14} /> Customer List</NavLink>
              </div>
            )}
          </div>
          
          {/* Reports */}
          {permissions.canViewReports && (
            <div className="space-y-1">
              <NavItem icon={BarChart2} label="Reports" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('reports')} isOpen={openSubMenu === 'reports'} />
              {!isSidebarCollapsed && openSubMenu === 'reports' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/reports/daily-summary" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><FileText size={14} /> Daily Summary</NavLink>
                  <NavLink to="/reports/qb-export" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><Download size={14} /> QB Export</NavLink>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {permissions.canManageUsers && (
            <div className="space-y-1">
              <NavItem icon={UserCog} label="Users" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('user')} isOpen={openSubMenu === 'user'} />
              {!isSidebarCollapsed && openSubMenu === 'user' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/addUser" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><UserPlus size={14} /> Add User</NavLink>
                  <NavLink to="/all-users" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-white ${isActive ? 'text-white font-bold' : 'text-gray-500'}`}><List size={14} /> Show All Users</NavLink>
                  <NavLink to="/delete-user" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-red-400 ${isActive ? 'text-red-400 font-bold' : 'text-gray-500'}`}><UserMinus size={14} /> Delete User</NavLink>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {permissions.canAddProducts && (
            <div className="space-y-1">
              <NavItem icon={Package} label="Products" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('product')} isOpen={openSubMenu === 'product'} />
              {!isSidebarCollapsed && openSubMenu === 'product' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/inventory" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><SlidersHorizontal size={14} /> Inventory</NavLink>
                  <NavLink to="/addProduct" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><PlusCircle size={14} /> Add Product</NavLink>
                  <NavLink to="/categories" className={({isActive}) => `flex items-center gap-2 w-full p-2 text-[11px] hover:text-[#b4a460] ${isActive ? 'text-[#b4a460] font-bold' : 'text-gray-500'}`}><List size={14} /> Categories</NavLink>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mt-4 mb-2 ml-2 text-left">Help</p>}
          <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/support" icon={HelpCircle} label="Support" isCollapsed={isSidebarCollapsed} />
        </div>
      </nav>

      <div onClick={() => navigate('profile')} className={`mt-auto pt-6 border-t border-gray-800 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3 p-2 bg-[#1A1A1A] rounded-xl border border-gray-800 mb-4 text-left">
            <img src="https://i.pravatar.cc/150?u=hasala" className="w-8 h-8 rounded-lg" alt="profile" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate text-white">{user.full_name || 'Hasala Shehan'}</p>
              <p className="text-[9px] text-[#b4a460] uppercase truncate font-semibold tracking-wider">{userRole}</p>
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