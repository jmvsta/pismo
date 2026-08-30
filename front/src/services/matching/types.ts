import type { UserSummary } from '../user/types.ts'

export type PenPalRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'

export interface MatchProfile extends UserSummary {
  countryCode: string | null
}

export interface UserMatch {
  userA: MatchProfile
  userB: MatchProfile
  score: number
  sharedInterests: string[]
  computedAt: string
}

export interface SuggestedProfile {
  user: MatchProfile
  score: number | null
  sharedInterests: string[]
}

export interface PenPalRequest {
  id: string
  requester: UserSummary
  addressee: UserSummary
  status: PenPalRequestStatus
  message: string | null
  createdAt: string
  respondedAt: string | null
}

export interface PenPalConnectionSummary {
  id: string
  userA: UserSummary
  userB: UserSummary
  establishedAt: string
  endedAt: string | null
}

export interface PenPalConnection extends PenPalConnectionSummary {
  request: PenPalRequest | null
  endedBy: UserSummary | null
}
