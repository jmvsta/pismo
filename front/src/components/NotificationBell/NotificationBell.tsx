import { useState } from 'react'
import { useNotificationStore } from '../../store/notificationStore.ts'

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-ghost relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-[var(--color-accent)] px-1 text-center text-[11px] leading-4 text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 max-h-96 w-80 overflow-y-auto border border-[var(--color-divider)] bg-[var(--color-surface)]">
          {notifications.length === 0 && <p className="text-muted p-3">No notifications yet.</p>}
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className="block w-full border-b border-[var(--color-divider)] p-3 text-left last:border-b-0"
              onClick={() => markRead(notification.id)}
            >
              <div className={notification.readAt ? 'text-muted' : 'font-semibold'}>{notification.title}</div>
              {notification.body && <div className="text-muted">{notification.body}</div>}
              <div className="text-muted text-xs">{formatRelativeTime(notification.createdAt)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
