import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AuthBar from './components/AuthBar.tsx'
import { useUserStore } from './store/userStore.ts'
import Forum from './pages/Forum/Forum.tsx'
import Register from './pages/Register/Register.tsx'
import Login from './pages/Login/Login.tsx'
import Questionnaire from './pages/Questionnaire/Questionnaire.tsx'
import Profile from './pages/Profile/Profile.tsx'
import Admin from './pages/Admin/Admin.tsx'
import Wallet from './pages/Wallet/Wallet.tsx'

const AUTH_PAGES = ['/login', '/register']

function App() {
  const location = useLocation()
  const loadCurrentUser = useUserStore((state) => state.loadCurrentUser)

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  return (
    <>
      {!AUTH_PAGES.includes(location.pathname) && <AuthBar />}
      <Routes>
        <Route path="/" element={<Forum />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/profile/:userId?" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </>
  )
}

export default App
