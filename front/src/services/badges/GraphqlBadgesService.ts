import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type { Badge, UserBadge } from './types.ts'
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
}
