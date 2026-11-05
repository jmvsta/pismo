import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/userStore.ts'
import { useNotificationStore } from '../store/notificationStore.ts'
import { useLanguageStore } from '../store/languageStore.ts'
import { uiText } from '../i18n/uiText.ts'
import { imageUrl } from '../services/imageUrl.ts'
import NotificationBell from './NotificationBell/NotificationBell.tsx'
import ThemeToggle from './ThemeToggle/ThemeToggle.tsx'
import LanguageSwitcher from './LanguageSwitcher/LanguageSwitcher.tsx'
import './AuthBar.css'

function AuthBar() {
  const currentUser = useUserStore((state) => state.currentUser)
  const logout = useUserStore((state) => state.logout)
  const connectNotifications = useNotificationStore((state) => state.connect)
  const disconnectNotifications = useNotificationStore((state) => state.disconnect)
  const language = useLanguageStore((state) => state.language)
  const onProfilePage = useLocation().pathname.startsWith('/profile')

  useEffect(() => {
    if (!currentUser) return
    connectNotifications()
    return () => disconnectNotifications()
  }, [currentUser, connectNotifications, disconnectNotifications])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'
  const avatarUrl = currentUser ? imageUrl(currentUser.avatarImageId) : null

  return (
    <div className={`auth-bar${currentUser ? '' : ' auth-bar-guest'}`}>
      <nav className="auth-bar-nav">
        <Link to="/about" className="auth-bar-about-link">{uiText('navAbout', language)}</Link>
        {currentUser && <Link to="/matches" className="auth-bar-penpals-link">{uiText('navPenPals', language)}</Link>}
      </nav>
      <Link to="/" className="auth-bar-brand">PISMO NA DAR</Link>
      <div className="auth-bar-actions">
        <ThemeToggle />
        <LanguageSwitcher className="auth-bar-lang" />
        {currentUser ? (
          <>
            <NotificationBell />
            {canModerate && (
              <Link
                to="/admin"
                className="btn btn-icon auth-bar-icon auth-bar-pen"
                aria-label={uiText('navModerate', language)}
                title={uiText('navModerate', language)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </Link>
            )}
            {onProfilePage ? (
              <button
                type="button"
                className="btn btn-ghost auth-bar-icon auth-bar-logout"
                onClick={handleLogout}
                aria-label={uiText('navLogOut', language)}
                title={uiText('navLogOut', language)}
              >
                <svg
                  viewBox="1.5 1 21 21"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ overflow: 'visible' }}
                >
                  <path d="M12 2v10" />
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                </svg>
              </button>
            ) : (
              <Link
                to="/profile?tab=penpals"
                className="auth-bar-avatar"
                aria-label="My profile"
                title={currentUser.nickname}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" />
                ) : (
                  <span className="auth-bar-avatar-placeholder">{currentUser.nickname.charAt(0).toUpperCase()}</span>
                )}
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              {uiText('navLogIn', language)}
            </Link>
            <Link to="/register" className="btn btn-secondary">
              {uiText('navRegister', language)}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthBar
