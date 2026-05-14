import React, { useState, useEffect } from 'react';
import { useAuth } from '../pages/context/AuthContext';
import { getAssetUrl } from '../pages/utils/cloudinaryHelper';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  BarChart2, Settings, HelpCircle, LogOut, ChevronDown, 
  ChevronRight, Menu, Inbox, SlidersHorizontal, PlusCircle, 
  ChevronLeft, UserPlus, UserMinus, UserCog, List, FileText, 
  Download, History, PackageX, ShoppingBasket, ReceiptText, Tag, Boxes, X,
  PackagePlus, PackageSearch, SquarePen, Sun, Moon
} from 'lucide-react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import ViewOrders from '../pages/management/order/ViewOrders';
import axios from 'axios';

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
    canManageStocks: true,
    canViewStocks: true
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
    canManageStocks: false,
    canViewStocks: true
  }
};

const NavItem = ({ to, icon: Icon, label, isCollapsed, badge, onClick, isOpen }) => {
  const commonClasses = `flex items-center justify-between w-full p-2.5 rounded-xl transition-all duration-300 group relative hover:z-[1000]`;
  const activeClasses = ({ isActive }) => `
    ${commonClasses}
    ${isActive ? 'bg-primary/15 text-primary border border-primary/20 font-bold shadow-[0_0_15px_rgba(180,164,96,0.1)]' : 'text-textMain/50 hover:bg-primary/5 hover:text-primary'}
  `;

  const renderContent = () => (
    <>
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0" />
        {!isCollapsed && <span className="text-sm">{label}</span>}
      </div>
      {badge && !isCollapsed && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 transition-all duration-300 text-[#8a7b42]">{badge}</span>}
      {!isCollapsed && onClick && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
    </>
  );

  if (to) return <NavLink to={to} className={activeClasses}>{renderContent()}</NavLink>;
  return <button onClick={onClick} className={`${commonClasses} text-textMain/50 transition-colors duration-300 hover:bg-card transition-colors duration-300 hover:text-primary transition-all duration-300`}>{renderContent()}</button>;
};

const SideBar = ({ isSidebarCollapsed, setIsSidebarCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const [openSubMenu, setOpenSubMenu] = useState(''); 
  const navigate = useNavigate();
  const {logout} = useAuth(); // useAuth() hook එකෙන් logOut function එක ගන්නවා
  const [systemSettings, setSystemSettings] = useState(null);
  const currentTheme = localStorage.getItem('theme') || 'light';
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  const [loggedUser, setLoggedUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  });

  const userRole = loggedUser?.role || 'sales_rep';
  const permissions = menuConfig[userRole] || menuConfig.sales_rep;
  const profileImg = loggedUser?.profile_image || loggedUser?.picture_url;
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser) setLoggedUser(updatedUser);
    };
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location]);

  const toggleTheme = () => {
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
    }
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleToggleSubMenu = (menu) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenSubMenu(menu);
    } else {
      setOpenSubMenu(openSubMenu === menu ? '' : menu);
    }
  };

  const handleLogout = () => {
      logout();
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const url = token ? 'http://localhost:5001/api/settings' : 'http://localhost:5001/api/settings/public';
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const res = await axios.get(url, { headers });
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Sidebar branding fetch failed:", err.response?.data || err.message);
      }
    };

    fetchBranding();
  }, []);

  const getDynamicLogo = () => {
    // 1. check if logo url relevant to theme
    const dbLogo = isDark 
        ? systemSettings?.dark_logo_url 
        : systemSettings?.light_logo_url;

    return dbLogo || (isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png");
  };

  return (
    <>
      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside className={`bg-sidebar text-textMain flex flex-col p-5 fixed h-full z-50 border-r border-border shadow-lg md:shadow-sm w-64 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:transition-all ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
      
      {/* --- Brand Logo Section --- */}
      <div className={`mb-8 flex items-center ${isSidebarCollapsed ? 'md:flex-col md:gap-4 md:justify-center' : 'justify-between'} px-1`}>
          <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => !isSidebarCollapsed && navigate('/home')}
          >
              <img 
                  src={getDynamicLogo()} 
                  alt="Mehera Logo" 
                  className={`transition-all duration-500 ease-in-out object-contain will-change-[opacity,transform] ${
                      isSidebarCollapsed
                          ? 'w-10 h-10 rounded-lg p-1' // 🤏 The sidebar is small (like an icon).
                          : 'w-32 h-10'                // ↔️ The side bar is big time.
                  }`}
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Mehera&background=b4a460&color=fff' }}
              />
          </div>

          <div className={`flex items-center ${isSidebarCollapsed ? 'md:flex-col md:gap-2' : 'gap-2'}`}>
              <button 
                  onClick={toggleTheme} 
                  className="text-textMain/50 transition-colors duration-300 hover:text-primary p-2.5 rounded-lg hover:bg-card/10 transition-all"
              >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  className="hidden md:block text-textMain/50 transition-colors duration-300 hover:text-primary p-2.5 rounded-lg hover:bg-card/10 transition-colors duration-300 transition-all"
              >
                  {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
              </button>
              <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-textMain/50 p-2.5">
                  <X size={20} />
              </button>
          </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1 text-left">
        {/* Menu Section */}
        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-textMain/50 transition-colors duration-300 font-black mb-2 ml-2 tracking-widest">Menu</p>}
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
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-textMain/50 transition-colors duration-300 font-black mb-2 ml-2 tracking-widest">Management</p>}
          
          {/* Order */}
          {permissions.canViewOrders && (
            <>
              <NavItem icon={ReceiptText} label="Orders" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('orders')} isOpen={openSubMenu === 'orders'} />
              {!isSidebarCollapsed && openSubMenu === 'orders' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  {permissions.canFullManageUsers && (
                    <>
                      <NavLink to="/orders?add-order" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><ShoppingBasket size={14} /> Add Order</NavLink>
                    </>
                  )}
                  <NavLink to="/view-orders" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><History size={14} /> Order List </NavLink>
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
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  {permissions.canAddCustomers && (
                    <NavLink to="/add-customer" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><UserPlus size={14} /> Add Customer</NavLink>
                  )}

                  <NavLink 
                    to="/customers" 
                    className={({ isActive }) => 
                      `flex items-center gap-2 p-2 text-[11px] transition-colors ${
                        isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'
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
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  <NavLink to="/reports/daily-summary" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><FileText size={14} /> Daily Summary</NavLink>
                  <NavLink to="/reports/qb-export" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><Download size={14} /> QB Export</NavLink>
                </div>
              )}
            </>
          )}

          {/* Users Section */}
          {permissions.canViewUsers && (
            <>
              <NavItem icon={UserCog} label="Users" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('user')} isOpen={openSubMenu === 'user'} />
              {!isSidebarCollapsed && openSubMenu === 'user' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  {permissions.canFullManageUsers && (
                    <>
                      <NavLink to="/addUser" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><UserPlus size={14} /> Add User</NavLink>
                      <NavLink to="/delete-user" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><UserMinus size={14} /> Delete User</NavLink>
                      <NavLink to="/assign-user" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><UserMinus size={14} /> Assign User</NavLink>
                    </>
                  )}
                  <NavLink to="/all-users" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><List size={14} /> User List </NavLink>
                </div>
              )}
            </>
          )}

          {/* Brand section */}
          {permissions.canManageBrands && (
            <>
              <NavItem icon={Tag} label="Brands" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('brand')} isOpen={openSubMenu === 'brand'} />
              {!isSidebarCollapsed && openSubMenu === 'brand' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  <NavLink to="/getBrands" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><SlidersHorizontal size={14} /> Brands</NavLink>
                  <NavLink to="/addBrand" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><PlusCircle size={14} /> Add Brand</NavLink>
                </div>
              )}
            </>
          )}

          {/* Categories Section */}
          {permissions.canManageCategories && (
            <>
              <NavItem icon={List} label="Categories" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('category')} isOpen={openSubMenu === 'category'} />
              {!isSidebarCollapsed && openSubMenu === 'category' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  <NavLink to="/getCategories" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><List size={14} /> Categories</NavLink>
                  <NavLink to="/addCategory" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><PlusCircle size={14} /> Add Category</NavLink>
                </div>
              )}
            </>
          )}

          {/* Products Section */}
          {permissions.canManageProducts && (
            <>
              <NavItem icon={Package} label="Products" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('product')} isOpen={openSubMenu === 'product'} />
              {!isSidebarCollapsed && openSubMenu === 'product' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><SlidersHorizontal size={14} /> Inventory</NavLink>
                  {userRole === 'admin' && (
                    <NavLink to="/addProduct" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><PlusCircle size={14} /> Add Product</NavLink>
                  )}
                </div>
              )}
            </>
          )}

          {/* stock section */}
          {permissions.canViewStocks && (
            <>
              <NavItem icon={Boxes} label="Stocks" isCollapsed={isSidebarCollapsed} onClick={() => handleToggleSubMenu('stock')} isOpen={openSubMenu === 'stock'} />
              {!isSidebarCollapsed && openSubMenu === 'stock' && (
                <div className="ml-9 space-y-1 border-l border-border transition-colors duration-300 pl-2">
                  {permissions.canManageStocks && (
                    <>
                      <NavLink to="/addStock" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><PackagePlus size={14} /> Add Stocks</NavLink>
                      <NavLink to="/editStock" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><SquarePen size={14} /> Edit Stocks</NavLink>
                    </>
                  )}
                  <NavLink to="/viewStock" className={({ isActive }) => `flex items-center gap-2 p-2 text-[11px] transition-colors ${isActive ? 'text-primary transition-all duration-300 font-bold' : 'text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300'}`}><PackageSearch size={14} /> View Stocks </NavLink>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-1">
          {!isSidebarCollapsed && <p className="text-[10px] uppercase text-textMain/50 transition-colors duration-300 font-black mt-4 mb-2 ml-2 tracking-widest">Help</p>}
          <NavItem to="/settingsPage" icon={Settings} label="Settings" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/support" icon={HelpCircle} label="Support" isCollapsed={isSidebarCollapsed} />
        </div>
      </nav>

      {/* Profile Section */}
      <div 
        onClick={() => navigate(`/profile/${loggedUser.user_id}`)} 
        className={`mt-auto pt-6 border-t border-border transition-colors duration-300 cursor-pointer ${isSidebarCollapsed ? 'md:flex md:flex-col md:items-center' : ''}`}
        >
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-3 p-2 bg-card transition-colors duration-300 rounded-xl border border-border transition-colors duration-300 mb-4 text-left hover:bg-primary/5 transition-all duration-300 transition-all">
            
            {profileImg ? (
              <img 
                src={profileImg} 
                className="w-8 h-8 rounded-lg object-cover shadow-sm border border-white" 
                alt="profile" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary transition-all duration-300 flex items-center justify-center text-white font-bold text-[10px] shrink-0 uppercase shadow-sm">
                {getInitials(loggedUser?.name || loggedUser?.full_name)}
              </div>
            )}

            <div className="overflow-hidden">
              {/* <p className="text-[11px] font-black truncate text-textMain transition-colors duration-300"> */}
              {/* testing dark theme */}
              <p className="text-[11px] font-black truncate text-textMain">
                {loggedUser?.name || 'User'}
              </p>
              <p className="text-[9px] text-primary transition-all duration-300 font-bold uppercase tracking-wider">
                {loggedUser?.role?.replace('_', ' ') || 'Sales Rep'}
              </p>
            </div>

          </div>
        ) : (
          <div className="mb-4">
            {profileImg ? (
              <img 
                src={profileImg} 
                className="w-8 h-8 rounded-lg object-cover border border-border transition-colors duration-300 shadow-sm" 
                alt="profile" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary transition-all duration-300 flex items-center justify-center text-white font-bold text-[10px] border border-white uppercase shadow-sm">
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
        className={`flex items-center gap-3 w-full p-2 text-[11px] font-bold text-textMain/50 transition-colors duration-300 hover:text-red-500 transition-colors ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
      >
        <LogOut size={16} /> 
        {!isSidebarCollapsed && "Logout"}
      </button>
    </aside>
    </>
  );
};

export default SideBar;