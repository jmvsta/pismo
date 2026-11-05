import type { UserAddress } from '../../services/address/index.ts'

export function formatAddress(address: UserAddress): string {
  return [
    address.recipientName,
    address.streetLine1,
    address.streetLine2,
    address.city,
    address.region,
    address.postalCode,
    address.countryCode,
  ]
    .filter(Boolean)
    .join(', ')
}
