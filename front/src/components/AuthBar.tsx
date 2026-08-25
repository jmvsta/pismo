import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore.ts'
import './AuthBar.css'

function AuthBar() {
  const currentUser = useUserStore((state) => state.currentUser)
  const logout = useUserStore((state) => state.logout)

  return (
    <div className="auth-bar">
      {currentUser ? (
        <>
          <span className="auth-bar-nickname">{currentUser.nickname}</span>
          <button type="button" className="btn btn-ghost" onClick={() => logout()}>
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </>
      )}
    </div>
  )
}

export default AuthBar
