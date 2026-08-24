import { Route, Routes } from 'react-router-dom'
import Forum from './pages/Forum/Forum.tsx'
import Register from './pages/Register/Register.tsx'
import Questionnaire from './pages/Questionnaire/Questionnaire.tsx'
import Profile from './pages/Profile/Profile.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Forum />} />
      <Route path="/register" element={<Register />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App
