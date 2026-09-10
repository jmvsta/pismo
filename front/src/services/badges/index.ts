import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlBadgesService } from './GraphqlBadgesService.ts'

export type { BadgesService } from './BadgesService.ts'
export type { Badge, LetterRankBadge, UserBadge, UserLetterRankBadge } from './types.ts'

export const badgesService = new GraphqlBadgesService(graphqlClient)
