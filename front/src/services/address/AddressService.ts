import type {
  ConnectionAddressConsent,
  CreateAddressInput,
  UpdateAddressInput,
  UserAddress,
} from './types.ts'

export interface AddressService {
  myAddresses(): Promise<UserAddress[]>
  addressConsentsForConnection(connectionId: string): Promise<ConnectionAddressConsent[]>
  createAddress(input: CreateAddressInput): Promise<UserAddress>
  updateAddress(id: string, input: UpdateAddressInput): Promise<UserAddress>
  deleteAddress(id: string): Promise<boolean>
  grantAddressConsent(connectionId: string, addressId: string): Promise<ConnectionAddressConsent>
  revokeAddressConsent(connectionId: string): Promise<ConnectionAddressConsent>
}
