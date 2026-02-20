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
import Home from './pages/roles/Home';

// User Management (Now in management/user folder)
import AddUser from './pages/management/user/AddUser';
import ViewUsers from './pages/management/user/ViewUser';
import UpdateUser from './pages/management/user/UpdateUser';
import DeleteUser from './pages/management/user/DeleteUser';


function App() {
  const storedUser = localStorage.getItem('user');
  const user = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;
  const userRole = user?.role;
  const isFirstLogin = user?.is_first_login === 1;

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/change-password' element={user ? <ChangePassword /> : <Navigate to="/login" />} />
      
      <Route element={<DashboardLayout />}>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* 1. Dashboard එකට යන්න පුළුවන් Admin සහ Manager ට විතරයි */}
        <Route 
          path="/dashboard" 
          element={
            isFirstLogin ? <Navigate to="/change-password" /> : 
            (['admin', 'manager'].includes(userRole) ? <Dashboard /> : <Navigate to="/home" />) 
          } 
        />

        <Route 
          path="/home" 
          element={
            isFirstLogin ? <Navigate to="/change-password" /> : 
            (['sales_rep', 'online_store_keeper'].includes(userRole) ? <Home /> : <Navigate to="/dashboard" />)
          } 
        />

        {/* 3. User Management - Admin ට පමණි */}
        <Route path='/addUser' element={userRole === 'admin' ? <AddUser /> : <Navigate to="/dashboard" />} />
        <Route path='/all-users' element={['admin', 'manager'].includes(userRole) ? <ViewUsers /> : <Navigate to="/dashboard" />} />

      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;