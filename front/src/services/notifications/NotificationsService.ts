import type { Notification } from './types.ts'

export interface NotificationsService {
  myNotifications(unreadOnly?: boolean): Promise<Notification[]>
  unreadNotificationCount(): Promise<number>
  markNotificationRead(id: string): Promise<Notification>
}
