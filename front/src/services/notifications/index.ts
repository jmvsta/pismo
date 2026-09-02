import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlNotificationsService } from './GraphqlNotificationsService.ts'

export type { NotificationsService } from './NotificationsService.ts'
export type { Notification, NotificationType } from './types.ts'

export const notificationsService = new GraphqlNotificationsService(graphqlClient)
