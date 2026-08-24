import type { PenPalConnectionSummary } from '../matching/types.ts'
import type { UserSummary } from '../user/types.ts'

export type AddressConsentStatus = 'GRANTED' | 'REVOKED'

/** Confidential. Never exposed for another user directly -- only through a GRANTED ConnectionAddressConsent. */
export interface UserAddress {
  id: string
  recipientName: string
  streetLine1: string
  streetLine2: string | null
  city: string
  region: string | null
  postalCode: string | null
  countryCode: string
  isPrimary: boolean
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * One row per user per connection: has this user shared their address with the
 * other side? No row, or REVOKED, means letters go through the team relay.
 */
export interface ConnectionAddressConsent {
  id: string
  connection: PenPalConnectionSummary
  grantor: UserSummary
  address: UserAddress | null
  status: AddressConsentStatus
  grantedAt: string
  revokedAt: string | null
}

export interface CreateAddressInput {
  recipientName: string
  streetLine1: string
  streetLine2?: string
  city: string
  region?: string
  postalCode?: string
  countryCode: string
  isPrimary?: boolean
}

export interface UpdateAddressInput {
  recipientName?: string
  streetLine1?: string
  streetLine2?: string
  city?: string
  region?: string
  postalCode?: string
  countryCode?: string
  isPrimary?: boolean
}
