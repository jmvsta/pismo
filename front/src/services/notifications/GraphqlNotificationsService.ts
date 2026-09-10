import type { GraphqlClient } from '../graphqlClient.ts'
import type { Notification } from './types.ts'
import type { NotificationsService } from './NotificationsService.ts'

const NOTIFICATION_FIELDS = `
  id
  type
  title
  body
  readAt
  createdAt
`

const MY_NOTIFICATIONS_QUERY = `
  query MyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      ${NOTIFICATION_FIELDS}
    }
  }
`

const UNREAD_NOTIFICATION_COUNT_QUERY = `
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`

const MARK_NOTIFICATION_READ_MUTATION = `
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      ${NOTIFICATION_FIELDS}
    }
  }
`

export class GraphqlNotificationsService implements NotificationsService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async myNotifications(unreadOnly?: boolean): Promise<Notification[]> {
    const data = await this.client.request<{ myNotifications: Notification[] }, { unreadOnly?: boolean }>(
      MY_NOTIFICATIONS_QUERY,
      { unreadOnly },
    )
    return data.myNotifications
  }

  async unreadNotificationCount(): Promise<number> {
    const data = await this.client.request<{ unreadNotificationCount: number }>(UNREAD_NOTIFICATION_COUNT_QUERY)
    return data.unreadNotificationCount
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const data = await this.client.request<{ markNotificationRead: Notification }, { id: string }>(
      MARK_NOTIFICATION_READ_MUTATION,
      { id },
    )
    return data.markNotificationRead
  }
}
