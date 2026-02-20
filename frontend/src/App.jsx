import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

// Shared Pages (Now in shared folder)
import Inbox from './pages/shared/Inbox';
import UserProfile from './pages/shared/UserProfile';

// Role Dashboards (Now in roles folder)
import Dashboard from './pages/roles/Dashboard';
import SalesRepDashboard from './pages/roles/SalesRepDashboard';
import StoreKeeper from './pages/roles/StoreKeeper';

// User Management (Now in management/user folder)
import AddUser from './pages/management/user/AddUser';
import ViewUsers from './pages/management/user/ViewUser';
import UpdateUser from './pages/management/user/UpdateUser';
import DeleteUser from './pages/management/user/DeleteUser';


function App() {
  // LocalStorage එකෙන් user දත්ත ලබා ගැනීම
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user?.role;

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/change-password' element={<ChangePassword />} />
      
      {/* --- Protected Routes (Login වූ අයට පමණි) --- */}
      <Route element={<DashboardLayout />}>
        
        {/* 1. Shared Pages - හැමෝටම පොදුයි */}
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* 2. Role Based Dashboards - අදාළ කෙනාට පමණි */}
        <Route 
          path="/dashboard" 
          element={['admin', 'manager'].includes(userRole) ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/sales-rep-dashboard" 
          element={userRole === 'sales_rep' ? <SalesRepDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/store-keeper-dashboard" 
          element={userRole === 'store_keeper' ? <StoreKeeper /> : <Navigate to="/login" />} 
        />

        {/* 3. User Management - Admin ට පමණක් සීමා වේ */}
        <Route 
          path='/addUser' 
          element={userRole === 'admin' ? <AddUser /> : <Navigate to={`/dashboard`} />} 
        />
        <Route 
          path='/all-users' 
          element={['admin', 'manager'].includes(userRole) ? <ViewUsers /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path='/updateUser' 
          element={userRole === 'admin' ? <UpdateUser /> : <Navigate to={`/dashboard`} />} 
        />
        <Route 
          path='/delete-user' 
          element={userRole === 'admin' ? <DeleteUser /> : <Navigate to={`/dashboard`} />} 
        />

        {/* 4. Customer Management (අපි ඊළඟට හදන්න ඉන්න ඒවා) */}
        {/* මෙතනට ඔයාගේ AddCustomer, CustomerList routes දාන්න පුළුවන් */}

      </Route>

      {/* වැරදි URL එකක් ගැහුවොත් Login එකට යැවීම */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;