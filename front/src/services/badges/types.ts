import type { UserSummary } from '../user/types.ts'

export interface Badge {
  id: string
  code: string
  title: string
  description: string | null
  iconUrl: string | null
  position: number
  active: boolean
}

export interface UserBadge {
  user: UserSummary
  badge: Badge
  awardedAt: string
}
