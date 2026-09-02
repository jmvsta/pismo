export type NotificationType = 'PEN_PAL_REQUEST' | 'LETTER_SENT' | 'LETTER_DELIVERED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
}
