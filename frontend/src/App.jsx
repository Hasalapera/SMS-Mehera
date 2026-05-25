import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./pages/context/AuthContext";
import {
  NotificationProvider,
  useNotifications,
} from "./pages/context/NotificationContext";
import DashboardLayout from "./components/DashboardLayout";
import { useEffect } from "react";
import api from "../src/api/axiosInstance";

//sales management
import Customer from "./pages/management/customer/Customer";
import AddCustomer from "./pages/management/customer/AddCustomer";
import ViewCustomer from "./pages/management/customer/ViewCustomer";
import CustomerDetail from "./pages/management/customer/CustomerDetail";
import Orders from "./pages/management/order/Orders";

//stock management
import AddStock from "./pages/management/stock/AddStock";
import EditStock from "./pages/management/stock/EditStock";
import ViewStock from "./pages/management/stock/ViewStock";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

// Shared Pages (Now in shared folder)
import Inbox from "./pages/shared/Inbox";
import UserProfile from "./pages/shared/UserProfile";
import Support from "./pages/shared/Support";
import UnderConstruction from "./pages/shared/UnderConstruction";

// Role Dashboards (Now in roles folder)
import Dashboard from "./pages/roles/Dashboard";
import Home from "./pages/roles/Home";
import LogisticsDashboard from "./pages/roles/LogisticsDashboard";
import History from "./pages/roles/History";

// User Management (Now in management/user folder)
import AddUser from "./pages/management/user/AddUser";
import ViewUsers from "./pages/management/user/ViewUser";
import DeleteUser from "./pages/management/user/DeleteUser";
import AssignUser from "./pages/management/user/AssignUser";
import AddUserBehavior from "./pages/management/user/AddUserBehavior";
import TargetAssignForm from "./pages/management/user/TargetAssignForm";

// Brand Management (Now in management/brand folder)
import AddBrand from "./pages/management/brand/AddBrand";
import ViewBrand from "./pages/management/brand/ViewBrand";

// Category management (Now in management/category folder)
import AddCategory from "./pages/management/category/AddCategory";
import ViewCategories from "./pages/management/category/ViewCategories";

// Product Management (Now in management/product folder)
import AddProduct from "./pages/management/product/AddProduct";
import ViewProduct from "./pages/management/product/ViewProduct";
import ProductDetail from "./pages/management/product/ProductDetail";

// Workshop Management (Now in management/workshop folder)
import ViewWorkshops from "./pages/management/workshop/ViewWorkshops";

//Order Management (Now in management/order folder)
import ViewOrders from "./pages/management/order/ViewOrders";
import AddOrder from "./pages/management/order/AddOrder";
import OrderHistory from "./pages/management/order/OrderHistory";

//Report Management
import SalesReport from "./pages/management/report/SalesReport";
import CurrentProgress from "./pages/management/report/CurrentProgress";
import ProductSummaryReport from "./pages/management/report/ProductSummaryReport";
import CriticalStock from "./pages/management/report/CriticalStock";
import SalesRepRanking from "./pages/management/report/SalesRepRanking";

//Quotation Management
import Quotation from "./pages/shared/Quotation";

//Settings
import SettingsPage from "./pages/SettingsPage";

import AddOnlineOrder from "./pages/management/order/AddOnlineOrder";

import OurBrands from "./pages/OurBrands";
import Workshops from "./pages/Workshops";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ConfirmDelivery from "./pages/shared/ConfirmDelivery";
import FloatingPopup from "./components/FloatingPopup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading Registry...</div>;

  const userRole = user?.role;
  const isFirstLogin =
    user?.is_first_login === 1 || user?.mustChangePassword === true;

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";

    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999,
        }}
        gutter={8}
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-text)",
            borderRadius: "16px",
            padding: "16px 24px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid var(--color-border)",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition:
              "background-color 0.5s ease-in-out, color 0.5s ease-in-out, border-color 0.5s ease-in-out",
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: "#b4a460",
              secondary: "#fff",
            },
            style: {
              borderLeft: "5px solid #b4a460",
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              borderLeft: "5px solid #ef4444",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/change-password"
          element={user ? <ChangePassword /> : <Navigate to="/login" />}
        />
        <Route path="/under-construction" element={<UnderConstruction />} />

        <Route path="/brands" element={<OurBrands />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/confirm-delivery/:orderId/:token"
          element={<ConfirmDelivery />}
        />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route element={user ? <DashboardLayout /> : <Navigate to="/" />}>
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/support" element={<Support />} />

          <Route
            path="/order/:id"
            element={
              ["admin", "manager", "sales_rep", "online_store_keeper"].includes(
                userRole,
              ) ? (
                <Quotation />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/viewStock"
            element={
              [
                "admin",
                "sales_rep",
                "online_store_keeper",
                "manager",
                "logistics_officer",
              ].includes(userRole) ? (
                <ViewStock />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/customer"
            element={
              ["admin", "sales_rep", "online_store_keeper", "manager"].includes(
                userRole,
              ) ? (
                <Customer />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/customers"
            element={
              ["admin", "manager", "sales_rep", "online_store_keeper"].includes(
                userRole,
              ) ? (
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
            path="/orders"
            element={
              userRole === "logistics_officer" ? (
                <LogisticsDashboard />
              ) : ["admin", "sales_rep", "online_store_keeper"].includes(
                  userRole,
                ) ? (
                <Orders />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/orders/history"
            element={
              userRole === "logistics_officer" ? (
                <History />
              ) : [
                  "admin",
                  "manager",
                  "sales_rep",
                  "online_store_keeper",
                ].includes(userRole) ? (
                <OrderHistory />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/add-online-order"
            element={
              ["admin", "online_store_keeper"].includes(userRole) ? (
                <AddOnlineOrder />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              isFirstLogin ? (
                <Navigate to="/change-password" />
              ) : ["admin", "manager"].includes(userRole) ? (
                <Dashboard />
              ) : userRole === "logistics_officer" ? (
                <Navigate to="/home" />
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
              ) : userRole === "logistics_officer" ? (
                <LogisticsDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          <Route
            path="/addUser"
            element={
              userRole === "admin" ? <AddUser /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/all-users"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <ViewUsers />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/add-user-behavior"
            element={
              userRole === "admin" ? (
                <AddUserBehavior />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/assign-user"
            element={
              ["admin"].includes(userRole) ? (
                <AssignUser />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/assign-targets"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <TargetAssignForm />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          <Route
            path="/delete-user"
            element={
              userRole === "admin" ? (
                <DeleteUser />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Brand management */}
          <Route
            path="/addBrand"
            element={
              userRole === "admin" ? <AddBrand /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/getBrands"
            element={
              userRole === "admin" ? (
                <ViewBrand />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Category management */}
          <Route
            path="/addCategory"
            element={
              userRole === "admin" ? (
                <AddCategory />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/getCategories"
            element={
              userRole === "admin" ? (
                <ViewCategories />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Product management */}
          <Route
            path="/addProduct"
            element={
              userRole === "admin" ? (
                <AddProduct />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/inventory"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <ViewProduct />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/product/:id"
            element={
              ["admin", "manager", "sales_rep", "online_store_keeper"].includes(
                userRole,
              ) ? (
                <ProductDetail />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          {/* ✅ Workshop Management Route */}
          <Route
            path="/manage-workshops"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <ViewWorkshops />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Orders management */}
          <Route
            path="/view-orders"
            element={
              userRole === "admin" ||
              userRole === "manager" ||
              userRole === "sales_rep" ||
              userRole === "online_store_keeper" ? (
                <ViewOrders />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/add-order"
            element={
              userRole === "admin" ||
              userRole === "sales_rep" ||
              userRole === "online_store_keeper" ? (
                <AddOrder />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Stock management (🛠️ varUserRole -> userRole ලෙස නිවැරදි කරන ලදි) */}
          <Route
            path="/addStock"
            element={
              userRole === "admin" ? <AddStock /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/editStock"
            element={
              userRole === "admin" ? (
                <EditStock />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/viewStock"
            element={
              ["admin", "manager", "sales_rep", "online_store_keeper"].includes(
                userRole,
              ) ? (
                <ViewStock />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Report management */}
          <Route
            path="/sales-report"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <SalesReport />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/current-progress"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <CurrentProgress />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/product-summary"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <ProductSummaryReport />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/critical-stock"
            element={
              ["admin", "manager"].includes(userRole) ? (
                <CriticalStock />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route path="/rep-ranking" element={<SalesRepRanking />} />

          {/* Settings page */}
          <Route
            path="/settingsPage"
            element={
              ["admin", "manager", "sales_rep", "online_store_keeper"].includes(
                userRole,
              ) ? (
                <SettingsPage />
              ) : (
                <Navigate to="/home" />
              )
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/under-construction" replace />}
        />
      </Routes>

      <FloatingPopup />
    </>
  );
}

// Add this ABOVE export default
function NotificationCleaner() {
  const { user } = useAuth();
  const { clearNotifications } = useNotifications();

  useEffect(() => {
    clearNotifications();
  }, [user]);

  return null; // Renders nothing
}

function AppWithNotifications() {
  return (
    <NotificationProvider>
      <NotificationCleaner /> {/* Handles clearing */}
      <App />
    </NotificationProvider>
  );
}

export default AppWithNotifications;

//export default App;
