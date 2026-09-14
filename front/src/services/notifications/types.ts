export type NotificationType = 'PEN_PAL_REQUEST' | 'PEN_PAL_ACCEPTED' | 'LETTER_SENT' | 'LETTER_DELIVERED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  subjectId: string | null
  readAt: string | null
  createdAt: string
}
