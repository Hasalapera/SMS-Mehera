import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import UserList from './pages/admin/UserList'
import ChangePassword from './pages/ChangePassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import SalesRepDashboard from './pages/sales-rep/SalesRepDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import StoreKeeper from './pages/store-keeper/StoreKeeper'
import AddToCart from './pages/store-keeper/AddToCart'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element= {<UserList/>}/>
        <Route path='/login' element= {<Login/>}/>
        <Route path='change-password' element={<ChangePassword/>}/>
        <Route path='admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='sales-rep-dashboard' element={<SalesRepDashboard/>}/>
        <Route path='manager-dashboard' element={<ManagerDashboard/>}/>
        <Route path='store-keeper-dashboard' element={<StoreKeeper/>}/>
        <Route path='add-to-cart' element={<AddToCart/>}/>
      </Routes>
    </>
  )
}

export default App
