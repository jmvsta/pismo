import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type { Badge, LetterRankBadge, UserBadge, UserLetterRankBadge } from './types.ts'
import type { BadgesService } from './BadgesService.ts'

const BADGE_FIELDS = `
  id
  code
  title
  description
  iconUrl
  position
  active
`

const LETTER_RANK_BADGE_FIELDS = `
  id
  code
  title
  minLetters
  maxLetters
  iconUrl
  position
`

const BADGES_QUERY = `
  query Badges {
    badges {
      ${BADGE_FIELDS}
    }
  }
`

const MY_BADGES_QUERY = `
  query MyBadges {
    myBadges {
      user { ${USER_SUMMARY_FIELDS} }
      badge { ${BADGE_FIELDS} }
      awardedAt
    }
  }
`

const LETTER_RANK_BADGES_QUERY = `
  query LetterRankBadges {
    letterRankBadges {
      ${LETTER_RANK_BADGE_FIELDS}
    }
  }
`

const MY_LETTER_RANK_BADGES_QUERY = `
  query MyLetterRankBadges {
    myLetterRankBadges {
      user { ${USER_SUMMARY_FIELDS} }
      badge { ${LETTER_RANK_BADGE_FIELDS} }
      awardedAt
    }
  }
`

export class GraphqlBadgesService implements BadgesService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async badges(): Promise<Badge[]> {
    const data = await this.client.request<{ badges: Badge[] }>(BADGES_QUERY)
    return data.badges
  }

  async myBadges(): Promise<UserBadge[]> {
    const data = await this.client.request<{ myBadges: UserBadge[] }>(MY_BADGES_QUERY)
    return data.myBadges
  }

  async letterRankBadges(): Promise<LetterRankBadge[]> {
    const data = await this.client.request<{ letterRankBadges: LetterRankBadge[] }>(LETTER_RANK_BADGES_QUERY)
    return data.letterRankBadges
  }

  async myLetterRankBadges(): Promise<UserLetterRankBadge[]> {
    const data = await this.client.request<{ myLetterRankBadges: UserLetterRankBadge[] }>(
      MY_LETTER_RANK_BADGES_QUERY,
    )
    return data.myLetterRankBadges
  }
}
