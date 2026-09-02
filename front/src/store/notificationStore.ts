import { create } from 'zustand'
import { graphqlClient } from '../services/graphqlClient.ts'
import { notificationsService } from '../services/notifications/index.ts'
import type { Notification } from '../services/notifications/index.ts'
import { API_BASE_URL } from '../config/env.ts'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  connect: () => void
  disconnect: () => void
  markRead: (id: string) => Promise<void>
}

let socket: WebSocket | null = null

function notificationSocketUrl(token: string): string {
  const wsBase = API_BASE_URL.replace(/^http/, 'ws')
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  connect: () => {
    const token = graphqlClient.getAuthToken()
    if (!token || socket) return

    Promise.all([notificationsService.myNotifications(), notificationsService.unreadNotificationCount()])
      .then(([notifications, unreadCount]) => set({ notifications, unreadCount }))
      .catch(() => {
        // Best-effort history load -- live notifications still arrive over the socket below.
      })

    const ws = new WebSocket(notificationSocketUrl(token))
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data as string) as Notification
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }))
    }
    ws.onclose = () => {
      if (socket === ws) socket = null
    }
    socket = ws
  },

  disconnect: () => {
    socket?.close()
    socket = null
    set({ notifications: [], unreadCount: 0 })
  },

  markRead: async (id) => {
    const wasUnread = get().notifications.find((n) => n.id === id)?.readAt == null
    const updated = await notificationsService.markNotificationRead(id)
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? updated : n)),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }))
  },
}))
