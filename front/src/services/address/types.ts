
/** Confidential. Never exposed for another user directly -- only through penPalAddress, for people they are connected with. */
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
