import { Route, Routes } from 'react-router-dom'
import Forum from './pages/Forum/Forum.tsx'
import Register from './pages/Register/Register.tsx'
import Login from './pages/Login/Login.tsx'
import Questionnaire from './pages/Questionnaire/Questionnaire.tsx'
import Profile from './pages/Profile/Profile.tsx'
import Admin from './pages/Admin/Admin.tsx'
import Wallet from './pages/Wallet/Wallet.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Forum />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/wallet" element={<Wallet />} />
    </Routes>
  )
}

export default App
