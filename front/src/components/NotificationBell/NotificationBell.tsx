import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../../store/notificationStore.ts'
import type { Notification } from '../../services/notifications/index.ts'
import './NotificationBell.css'

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function notificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'PEN_PAL_REQUEST':
    case 'PEN_PAL_ACCEPTED':
      return '🤝'
    case 'LETTER_SENT':
    case 'LETTER_DELIVERED':
      return '✉️'
    default:
      return '🔔'
  }
}

function notificationHref(notification: Notification): string {
  switch (notification.type) {
    case 'PEN_PAL_REQUEST':
      return '/matches?tab=pending'
    case 'PEN_PAL_ACCEPTED':
      return notification.subjectId ? `/profile/${notification.subjectId}` : '/matches?tab=matched'
    case 'LETTER_SENT':
    case 'LETTER_DELIVERED':
      return '/profile?tab=letters'
    default:
      return '/'
  }
}

function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return

    const closeIfOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    const close = () => setIsOpen(false)

    document.addEventListener('mousedown', closeIfOutside)
    window.addEventListener('scroll', close, { capture: true })
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
      window.removeEventListener('scroll', close, { capture: true })
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) markRead(notification.id)
    setIsOpen(false)
    navigate(notificationHref(notification))
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="btn btn-ghost relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="notification-bell-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">Notifications</div>
          {notifications.length === 0 && <p className="text-muted notification-panel-empty">No notifications yet.</p>}
          <div className="notification-panel-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="notification-item"
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notification-item-icon">{notificationIcon(notification.type)}</span>
                <span className="notification-item-body">
                  <span className={notification.readAt ? 'notification-item-title' : 'notification-item-title is-unread'}>
                    {notification.title}
                  </span>
                  {notification.body && <span className="notification-item-detail">{notification.body}</span>}
                  <span className="notification-item-time">{formatRelativeTime(notification.createdAt)}</span>
                </span>
                {!notification.readAt && <span className="notification-item-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
