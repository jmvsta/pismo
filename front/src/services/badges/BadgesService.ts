import type { Badge, LetterRankBadge, UserBadge, UserLetterRankBadge } from './types.ts'

export interface BadgesService {
  badges(): Promise<Badge[]>
  myBadges(): Promise<UserBadge[]>
  letterRankBadges(): Promise<LetterRankBadge[]>
  myLetterRankBadges(): Promise<UserLetterRankBadge[]>
}
