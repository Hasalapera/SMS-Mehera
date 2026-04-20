import React, { useState, useEffect } from 'react';
import { useAuth } from '../pages/context/AuthContext';
import { getAssetUrl } from '../pages/utils/cloudinaryHelper';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  BarChart2, Settings, HelpCircle, LogOut, ChevronDown, 
  ChevronRight, Menu, Inbox, SlidersHorizontal, PlusCircle, 
  ChevronLeft, UserPlus, UserMinus, UserCog, List, FileText, 
  Download, UserCheck, ClipboardList, ShoppingBag, Tag
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import ViewOrders from '../pages/management/order/ViewOrders';

const menuConfig = {
  admin: { 
    canFullManageUsers: true, // CRUD (Add, Edit, Delete)
    canViewUsers: true, 
    canManageBrands: true, 
    canViewReports: true,
    canManageProducts: true,
    canManageCategories: true, 
    canEditInventory: true,
    canViewCustomers: true,
    canAddCustomers: true,
    canFullManageOrders: true, // Create, View, Edit, Delete
    canViewOrders: true, 
  },
  manager: { 
    canFullManageUsers: false, 
    canViewUsers: true,       
    canAddProducts: false, 
    canViewReports: true, 
    canManageBrands: false,
    canManageProducts: true,
    canManageCategories: false, 
    canEditInventory: false, 
    canViewCustomers: true,
    canAddCustomers: false,
    canViewOrders: true,
    canFullManageOrders: false,
  }
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
      {badge && !isCollapsed && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#b4a460]/20">{badge}</span>}
      {!isCollapsed && onClick && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
    </>
  );

  if (to) return <NavLink to={to} className={activeClasses}>{renderContent()}</NavLink>;
  return <button onClick={onClick} className={`${commonClasses} text-gray-400 hover:bg-white/10 hover:text-[#b4a460]`}>{renderContent()}</button>;
};

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const [openSubMenu, setOpenSubMenu] = useState(''); 
  const navigate = useNavigate();
  const {logout} = useAuth(); // useAuth() hook එකෙන් logOut function එක ගන්නවා
  
  const [loggedUser, setLoggedUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  });

  const userRole = loggedUser?.role || 'sales_rep';
  const permissions = menuConfig[userRole] || menuConfig.sales_rep;
  const profileImg = loggedUser?.profile_image || loggedUser?.picture_url;

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser) setLoggedUser(updatedUser);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggleSubMenu = (menu) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenSubMenu(menu);
    } else {
      setOpenSubMenu(openSubMenu === menu ? '' : menu);
    }
  };

  const handleLogout = () => {
      // localStorage.clear();
      // sessionStorage.clear();
      logout();
      // navigate('/', { replace: true });
      
      // window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`bg-[#141414] text-white flex flex-col p-5 transition-all duration-300 fixed h-full z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'} overflow-visible`}>
      
      {/* Brand Logo Section */}
      <div className={`mb-8 flex items-center ${isSidebarCollapsed ? 'flex-col gap-4' : 'justify-between'} px-1`}>
        
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <img 
            src={isSidebarCollapsed ? getAssetUrl('logo-icon') : getAssetUrl('main-logo')} 
            alt="Mehera Logo" 
            className={`${isSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain transition-all duration-300`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://ui-avatars.com/api/?name=Mehera&background=b4a460&color=000'} 
            }
          />

          {!isSidebarCollapsed && (
            <div className="flex flex-col text-left animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-xl font-serif tracking-widest leading-none">Mehera</span>
              <span className="text-[8px] tracking-[0.2em] text-[#b4a460] uppercase mt-1">
                International (Pvt) Ltd
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="text-gray-400 hover:text-[#b4a460] p-2.5 rounded-lg hover:bg-white/10 transition-all"
        >
          {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1 text-left">
        {/* Menu Section */}
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Menu</p>}
          <NavItem 
            to={`/dashboard`} 
            icon={LayoutDashboard} 
            label="Dashboard" 
            isCollapsed={isSidebarCollapsed} 
          />
          <NavItem to="/inbox" icon={Inbox} label="Inbox" badge="10" isCollapsed={isSidebarCollapsed} />
        </div>

        {/* Management Section */}
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 ml-2">Management</p>}
          
          {/* Orders Section */}
          {/* <NavItem icon={ShoppingCart} label="Orders" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('orders')} isOpen={openSubMenu === 'orders'} />
          {!isSidebarCollapsed && openSubMenu === 'orders' && (
            <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
              <NavLink to="/orders/new" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><PlusCircle size={14} /> New Order</NavLink>
              <NavLink to="/orders/history" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><ClipboardList size={14} /> Order History</NavLink>
            </div>
          )} */}

          {/* Order */}
          {permissions.canViewOrders && (
            <>
              <NavItem icon={UserCog} label="Orders" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('orders')} isOpen={openSubMenu === 'orders'} />
              {!isSidebarCollapsed && openSubMenu === 'orders' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  {/* Admin ට පමණක් පේන Full CRUD Actions */}
                  {permissions.canFullManageUsers && (
                    <>
                      <NavLink to="/orders?add-order" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><UserPlus size={14} /> Add Order</NavLink>
                      <NavLink to="/delete-order" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-red-400 transition-colors"><UserMinus size={14} /> Delete Order</NavLink>
                    </>
                  )}
                  {/* Admin සහ Manager දෙදෙනාටම පේන View Action */}
                  <NavLink to="/view-orders" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-white transition-colors"><List size={14} /> Order List </NavLink>
                </div>
              )}
            </>
          )}

          {/* Customers Section */}
          {permissions.canViewCustomers && (
            <div className="space-y-1">
              <NavItem 
                icon={Users} 
                label="Customers" 
                isCollapsed={isSidebarCollapsed} 
                onClick={() => handleToggleSubMenu('customers')} 
                isOpen={openSubMenu === 'customers'} 
              />
              {!isSidebarCollapsed && openSubMenu === 'customers' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  
                  {/* 🛡️ Manager ට පේන්නේ නැති වෙන්න මෙතනට permission check එකක් දැම්මා */}
                  {permissions.canAddCustomers && (
                    <NavLink 
                      to="/add-customer" 
                      className={({ isActive }) => 
                        `flex items-center gap-2 p-2 text-[11px] transition-colors ${
                          isActive ? 'text-[#b4a460]' : 'text-gray-500 hover:text-[#b4a460]'
                        }`
                      }
                    >
                      <UserPlus size={14} /> Add Customer
                    </NavLink>
                  )}

                  <NavLink 
                    to="/customers" 
                    className={({ isActive }) => 
                      `flex items-center gap-2 p-2 text-[11px] transition-colors ${
                        isActive ? 'text-[#b4a460]' : 'text-gray-500 hover:text-[#b4a460]'
                      }`
                    }
                  >
                    <List size={14} /> Customer List
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Reports Section */}
          {permissions.canViewReports && (
            <>
              <NavItem icon={BarChart2} label="Reports" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('reports')} isOpen={openSubMenu === 'reports'} />
              {!isSidebarCollapsed && openSubMenu === 'reports' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/reports/daily-summary" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><FileText size={14} /> Daily Summary</NavLink>
                  <NavLink to="/reports/qb-export" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><Download size={14} /> QB Export</NavLink>
                </div>
              )}
            </>
          )}

          {/* Users Section (Condition based on Role) */}
          {permissions.canViewUsers && (
            <>
              <NavItem icon={UserCog} label="Users" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('user')} isOpen={openSubMenu === 'user'} />
              {!isSidebarCollapsed && openSubMenu === 'user' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  {/* Admin ට පමණක් පේන Full CRUD Actions */}
                  {permissions.canFullManageUsers && (
                    <>
                      <NavLink to="/addUser" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><UserPlus size={14} /> Add User</NavLink>
                      <NavLink to="/delete-user" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-red-400 transition-colors"><UserMinus size={14} /> Delete User</NavLink>
                    </>
                  )}
                  {/* Admin සහ Manager දෙදෙනාටම පේන View Action */}
                  <NavLink to="/all-users" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-white transition-colors"><List size={14} /> User List </NavLink>
                </div>
              )}
            </>
          )}

          {/* Brand section */}
          {permissions.canManageBrands && (
            <>
              <NavItem icon={Tag} label="Brands" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('brand')} isOpen={openSubMenu === 'brand'} />
              {!isSidebarCollapsed && openSubMenu === 'brand' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/getBrands" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><SlidersHorizontal size={14} /> Brands</NavLink>
                  <NavLink to="/addBrand" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><PlusCircle size={14} /> Add Brand</NavLink>
                </div>
              )}
            </>
          )}

          {/* Categories Section */}
          {permissions.canManageCategories && (
            <>
              <NavItem icon={List} label="Categories" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('category')} isOpen={openSubMenu === 'category'} />
              {!isSidebarCollapsed && openSubMenu === 'category' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/getCategories" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><List size={14} /> Categories</NavLink>
                  <NavLink to="/addCategory" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><PlusCircle size={14} /> Add Category</NavLink>
                </div>
              )}
            </>
          )}

          {/* Products Section */}
          {permissions.canManageProducts && (
            <>
              <NavItem icon={Package} label="Products" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('product')} isOpen={openSubMenu === 'product'} />
              {!isSidebarCollapsed && openSubMenu === 'product' && (
                <div className="ml-9 space-y-1 border-l border-gray-800 pl-2">
                  <NavLink to="/inventory" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><SlidersHorizontal size={14} /> Inventory</NavLink>
                  {userRole === 'admin' && (
                    <NavLink to="/addProduct" className="flex items-center gap-2 p-2 text-[11px] text-gray-500 hover:text-[#b4a460] transition-colors"><PlusCircle size={14} /> Add Product</NavLink>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-gray-500 font-bold mt-4 mb-2 ml-2">Help</p>}
          <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/support" icon={HelpCircle} label="Support" isCollapsed={isSidebarCollapsed} />
        </div>
      </nav>

      {/* Profile Section */}
      <div 
        onClick={() => navigate(`/profile/${loggedUser.user_id}`)} 
        className={`mt-auto pt-6 border-t border-gray-800 cursor-pointer ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}
      >
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-3 p-2 bg-[#1A1A1A] rounded-xl border border-gray-800 mb-4 text-left hover:bg-white/5 transition-all">
            
            {profileImg ? (
              <img 
                src={profileImg} 
                className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                alt="profile" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#b4a460] flex items-center justify-center text-black font-bold text-[10px] shrink-0 uppercase">
                {getInitials(loggedUser?.name || loggedUser?.full_name)}
              </div>
            )}

            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate text-white">
                {loggedUser?.name || 'User'}
              </p>
              <p className="text-[9px] text-[#b4a460] uppercase tracking-[0.1em]">
                {loggedUser?.role?.replace('_', ' ') || 'Sales Rep'}
              </p>
            </div>

          </div>
        ) : (
          <div className="mb-4">
            {profileImg ? (
              <img 
                src={profileImg} 
                className="w-8 h-8 rounded-lg object-cover border border-gray-800" 
                alt="profile" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#b4a460] flex items-center justify-center text-black font-bold text-[10px] border border-gray-800 uppercase">
                {getInitials(loggedUser?.name || loggedUser?.full_name)}
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          handleLogout(); 
        }} 
        className={`flex items-center gap-3 w-full p-2 text-[11px] text-gray-500 hover:text-red-400 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={16} /> 
        {!isSidebarCollapsed && "Logout"}
      </button>
    </aside>
  );
};

export default SideBar;