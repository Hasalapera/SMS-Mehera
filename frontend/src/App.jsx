import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import UserList from './pages/admin/UserList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element= {<UserList/>}/>
        <Route path='/login' element= {<Login/>}/>
      </Routes>
    </>
  )
}

export default App
