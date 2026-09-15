import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore.ts'
import { useNotificationStore } from '../store/notificationStore.ts'
import { useLanguageStore } from '../store/languageStore.ts'
import type { Language } from '../store/languageStore.ts'
import { uiText } from '../i18n/uiText.ts'
import { imageUrl } from '../services/imageUrl.ts'
import NotificationBell from './NotificationBell/NotificationBell.tsx'
import ThemeToggle from './ThemeToggle/ThemeToggle.tsx'
import './AuthBar.css'

const LANGUAGES: Language[] = ['EN', 'RU', 'SRB']

function AuthBar() {
  const currentUser = useUserStore((state) => state.currentUser)
  const logout = useUserStore((state) => state.logout)
  const connectNotifications = useNotificationStore((state) => state.connect)
  const disconnectNotifications = useNotificationStore((state) => state.disconnect)
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

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
    <div className="auth-bar">
      <nav className="auth-bar-nav">
        <Link to="/" className="auth-bar-feed-link">
          {uiText('navFeed', language)}
        </Link>
        <Link to="/about">{uiText('navAbout', language)}</Link>
        {currentUser && (
          <>
            <Link to="/matches">
              <span className="nav-full">{uiText('navFindPenPal', language)}</span>
              <span className="nav-short">{uiText('navFind', language)}</span>
            </Link>
            <Link to="/profile?tab=penpals">
              <span className="nav-full">{uiText('navMyPenPals', language)}</span>
              <span className="nav-short">{uiText('navPenPals', language)}</span>
            </Link>
          </>
        )}
      </nav>
      <Link to="/" className="auth-bar-brand">
        <span className="brand-full">PISMO NA DAR</span>
        <span className="brand-short">{uiText('navHome', language)}</span>
      </Link>
      <div className="auth-bar-actions">
        <div className="auth-bar-lang">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`auth-bar-lang-btn${language === lang ? ' is-active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
        {currentUser ? (
          <>
            <NotificationBell />
            <ThemeToggle />
            {canModerate && (
              <Link
                to="/admin"
                className="btn btn-icon"
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
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleLogout}
              aria-label={uiText('navLogOut', language)}
              title={uiText('navLogOut', language)}
            >
              <span className="nav-full">{uiText('navLogOut', language)}</span>
              <svg
                className="nav-short"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2v10" />
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <ThemeToggle />
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
