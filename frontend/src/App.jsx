import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './pages/context/AuthContext';
import DashboardLayout from './components/DashboardLayout';

//sales management
import AddCustomer from "./pages/management/customer/Addcustomer";
import ViewCustomer from './pages/management/customer/ViewCustomer';
import CustomerDetail from './pages/management/customer/CustomerDetail';
import AddOrder from "./pages/management/order/AddOrder";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

// Shared Pages (Now in shared folder)
import Inbox from "./pages/shared/Inbox";
import UserProfile from "./pages/shared/UserProfile";
import Support from "./pages/shared/Support";

// Role Dashboards (Now in roles folder)
import Dashboard from "./pages/roles/Dashboard";
import Home from "./pages/roles/Home";

// User Management (Now in management/user folder)
import AddUser from "./pages/management/user/AddUser";
import ViewUsers from "./pages/management/user/ViewUser";
// import UpdateUser from './pages/management/user/UpdateUser';

import DeleteUser from './pages/management/user/DeleteUser';

// Brand Management (Now in management/brand folder)
import AddBrand from './pages/management/brand/AddBrand';
import ViewBrand from './pages/management/brand/ViewBrand';
// import UpdateBrand from './pages/management/brand/UpdateBrand';
// import DeleteBrand from './pages/management/brand/DeleteBrand';

// Category management (Now in management/category folder)
import AddCategory from './pages/management/category/AddCategory';
import ViewCategories from './pages/management/category/ViewCategories';
// import UpdateCategory from './pages/management/category/UpdateCategory';
// import DeleteCategory from './pages/management/category/DeleteCategory';

// Product Management (Now in management/product folder)
import AddProduct from './pages/management/product/AddProduct';
import ViewProduct from './pages/management/product/ViewProduct';
import ProductDetail from './pages/management/product/ProductDetail';
// import ViewProducts from './pages/management/product/ViewProducts';
// import UpdateProduct from './pages/management/product/UpdateProduct';
// import DeleteProduct from './pages/management/product/DeleteProduct';

//Settings
// import SettingsPage from './pages/SettingsPage';


function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading Registry...</div>; 
  // const storedUser = localStorage.getItem('user');
  // const user = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;
  const userRole = user?.role;
  const isFirstLogin = user?.is_first_login === 1 || user?.mustChangePassword === true;

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/change-password' element={user ? <ChangePassword /> : <Navigate to="/login" />} />
      
      <Route element={user ? <DashboardLayout /> : <Navigate to="/" />}>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/support" element={<Support />} />

        {/*DashboardLayout එක ඇතුළත : redirect to add customer*/}

        <Route
          path="/add-customer"
          element={
            ["admin", "sales_rep"].includes(userRole) ? (
              <AddCustomer />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        <Route
          path="/customers"
          element={
            ["admin", "manager", "sales_rep"].includes(userRole) ? (
              <ViewCustomer />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        <Route
          path="/customer/:id"
          element={
            ["admin", "manager", "sales_rep"].includes(userRole) ? (
              <CustomerDetail />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        {/* Add Order Route : redireact to add oder */}
        <Route
          path="/add-order"
          element={
            ["admin", "sales_rep"].includes(userRole) ? (
              <AddOrder />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        {/* 1. Dashboard එකට යන්න පුළුවන් Admin සහ Manager ට විතරයි */}
        <Route
          path="/dashboard"
          element={
            isFirstLogin ? (
              <Navigate to="/change-password" />
            ) : ["admin", "manager"].includes(userRole) ? (
              <Dashboard />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
        <Route
          path="/home"
          element={
            isFirstLogin ? (
              <Navigate to="/change-password" />
            ) : ["sales_rep", "online_store_keeper"].includes(userRole) ? (
              <Home />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        {/* 3. User Management - Admin ට පමණි */}
        <Route path='/addUser' element={userRole === 'admin' ? <AddUser /> : <Navigate to="/dashboard" />} />
        <Route path='/all-users' element={['admin', 'manager'].includes(userRole) ? <ViewUsers /> : <Navigate to="/dashboard" />} />
        <Route path='/delete-user' element={userRole === 'admin' ? <DeleteUser /> : <Navigate to="/dashboard" />} />

        {/* Brand management - only for admin */}
        <Route path='/addBrand' element={userRole === 'admin' ? <AddBrand /> : <Navigate to="/dashboard" />} />
        <Route path='/getBrands' element={userRole === 'admin' ? <ViewBrand /> : <Navigate to="/dashboard" />} />

        {/* Category management - only for admin */}
        <Route path='/addCategory' element={userRole === 'admin' ? <AddCategory /> : <Navigate to="/dashboard" />} /> 
        <Route path='/getCategories' element={userRole === 'admin' ? <ViewCategories /> : <Navigate to="/dashboard" />} /> 

        {/* product management - admin and manager can view; only admin can add */}
        <Route path='/addProduct' element={userRole === 'admin' ? <AddProduct /> : <Navigate to="/dashboard" />} />
        <Route path='/inventory' element={['admin', 'manager'].includes(userRole) ? <ViewProduct /> : <Navigate to="/dashboard" />} />
        <Route path='/product/:id' element={['admin', 'manager'].includes(userRole) ? <ProductDetail /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} /> */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
