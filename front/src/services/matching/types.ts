import type { UserSummary } from '../user/types.ts'

export type PenPalRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'

export interface UserMatch {
  userA: UserSummary
  userB: UserSummary
  score: number
  sharedInterests: string[]
  computedAt: string
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
