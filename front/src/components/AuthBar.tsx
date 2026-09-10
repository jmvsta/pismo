import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore.ts'
import { useNotificationStore } from '../store/notificationStore.ts'
import { useWalletStore } from '../store/walletStore.ts'
import { imageUrl } from '../services/imageUrl.ts'
import { formatMinorAmount } from '../lib/money.ts'
import NotificationBell from './NotificationBell/NotificationBell.tsx'
import './AuthBar.css'

function AuthBar() {
  const currentUser = useUserStore((state) => state.currentUser)
  const logout = useUserStore((state) => state.logout)
  const connectNotifications = useNotificationStore((state) => state.connect)
  const disconnectNotifications = useNotificationStore((state) => state.disconnect)
  const wallet = useWalletStore((state) => state.wallet)
  const loadWallet = useWalletStore((state) => state.loadWallet)

  useEffect(() => {
    if (!currentUser) return
    connectNotifications()
    return () => disconnectNotifications()
  }, [currentUser, connectNotifications, disconnectNotifications])

  useEffect(() => {
    if (!currentUser) return
    loadWallet()
  }, [currentUser, loadWallet])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'
  const avatarUrl = currentUser ? imageUrl(currentUser.avatarImageId) : null

  return (
    <div className="auth-bar">
      <nav className="auth-bar-nav">
        <Link to="/">Feed</Link>
        <Link to="/about">About us</Link>
        {currentUser && (
          <>
            <Link to="/matches">Find a pen pal</Link>
            <Link to="/profile?tab=penpals">My pen pals</Link>
          </>
        )}
      </nav>
      <Link to="/" className="auth-bar-brand">
        PISMO NA DAR
      </Link>
      <div className="auth-bar-actions">
        {currentUser ? (
          <>
            <span className="auth-bar-wallet-pill">
              Wallet · {wallet ? formatMinorAmount(wallet.balanceMinor, wallet.currency) : '—'}
            </span>
            <NotificationBell />
            {canModerate && (
              <Link to="/admin" className="btn btn-ghost">
                Moderate
              </Link>
            )}
            <Link to="/profile" className="auth-bar-avatar" aria-label="My profile" title={currentUser.nickname}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span className="auth-bar-avatar-placeholder">{currentUser.nickname.charAt(0).toUpperCase()}</span>
              )}
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
