import type { Badge, UserBadge } from './types.ts'

export interface BadgesService {
  badges(): Promise<Badge[]>
  myBadges(): Promise<UserBadge[]>
}
