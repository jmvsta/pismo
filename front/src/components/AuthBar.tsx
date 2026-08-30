import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore.ts'
import { matchingService } from '../services/matching/index.ts'
import EnvelopeIcon from './icons/EnvelopeIcon.tsx'
import './AuthBar.css'

function AuthBar() {
  const currentUser = useUserStore((state) => state.currentUser)
  const logout = useUserStore((state) => state.logout)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    matchingService
      .pendingIncomingRequestCount()
      .then((count) => {
        if (!cancelled) setPendingCount(count)
      })
      .catch(() => {
        // Best-effort notification -- a failed count shouldn't block the rest of the bar.
      })
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'

  return (
    <div className="auth-bar-zone">
      <div className="auth-bar">
        {currentUser ? (
          <>
            {pendingCount > 0 && (
              <Link
                to="/matches?tab=pending"
                className="auth-bar-envelope"
                title={`${pendingCount} pen pal request${pendingCount === 1 ? '' : 's'} waiting`}
                aria-label="Pending pen pal requests"
              >
                <EnvelopeIcon />
              </Link>
            )}
            {canModerate && (
              <Link to="/admin" className="btn btn-ghost">
                Moderate
              </Link>
            )}
            <Link to="/profile" className="auth-bar-nickname">
              {currentUser.nickname}
            </Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
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
    </div>
  )
}

export default AuthBar
