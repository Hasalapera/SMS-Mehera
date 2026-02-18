import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
// import UserList from './pages/admin/UserList'
import ChangePassword from './pages/ChangePassword'
import AdminDashboard from './pages/admin/AdminDashboard'
// import SalesRepDashboard from './pages/sales-rep/SalesRepDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
// import StoreKeeper from './pages/store-keeper/StoreKeeper'
import Inbox from './pages/admin/Inbox'
import AddUser from './pages/admin/user-management/AddUser'
import DashboardLayout from './components/DashboardLayout'
import ViewUsers from './pages/admin/user-management/ViewUser'
import UpdateUser from './pages/admin/user-management/UpdateUser'
import DeleteUser from './pages/admin/user-management/DeleteUser'
import LandingPage from './pages/LandingPage'
import UserProfile from './components/UserProfile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        {/* <Route path='/' element= {<UserList/>}/> */}
        <Route path='/' element= {<LandingPage/>}/>
        <Route path='/login' element= {<Login/>}/>
        <Route path='change-password' element={<ChangePassword/>}/>
        
        
        <Route element={<DashboardLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path='/addUser' element={<AddUser/>}/>
          <Route path='/all-users' element={<ViewUsers/>}/>
          <Route path='/updateUser' element={<UpdateUser/>}/>
          <Route path='/delete-user' element={<DeleteUser/>}/>
          <Route path='/profile' element={<UserProfile/>}/>
          
        </Route>
      </Routes>
    </>
  )
}

export default App
