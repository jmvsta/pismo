import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlMatchingService } from './GraphqlMatchingService.ts'

export type { MatchingService } from './MatchingService.ts'
export type {
  UserMatch,
  PenPalRequest,
  PenPalRequestStatus,
  PenPalConnection,
  PenPalConnectionSummary,
} from './types.ts'

export const matchingService = new GraphqlMatchingService(graphqlClient)
