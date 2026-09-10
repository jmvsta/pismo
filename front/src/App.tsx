import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AuthBar from './components/AuthBar.tsx'
import { useUserStore } from './store/userStore.ts'
import Forum from './pages/Forum/Forum.tsx'
import About from './pages/About/About.tsx'
import Register from './pages/Register/Register.tsx'
import VerifyEmail from './pages/Register/VerifyEmail.tsx'
import RegisterBio from './pages/Register/RegisterBio.tsx'
import RegisterAddress from './pages/Register/RegisterAddress.tsx'
import Login from './pages/Login/Login.tsx'
import OauthCallback from './pages/OauthCallback/OauthCallback.tsx'
import Questionnaire from './pages/Questionnaire/Questionnaire.tsx'
import Profile from './pages/Profile/Profile.tsx'
import Admin from './pages/Admin/Admin.tsx'
import Wallet from './pages/Wallet/Wallet.tsx'
import Matches from './pages/Matches/Matches.tsx'

const AUTH_PAGES = [
  '/login',
  '/register',
  '/register/verify-email',
  '/register/bio',
  '/register/address',
  '/oauth-callback',
]

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
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/verify-email" element={<VerifyEmail />} />
        <Route path="/register/bio" element={<RegisterBio />} />
        <Route path="/register/address" element={<RegisterAddress />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-callback" element={<OauthCallback />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/profile/:userId?" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </>
  )
}

export default App
