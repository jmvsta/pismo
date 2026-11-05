import type {
  CreateAddressInput,
  UpdateAddressInput,
  UserAddress,
} from './types.ts'

export interface AddressService {
  myAddresses(): Promise<UserAddress[]>
  penPalAddress(connectionId: string): Promise<UserAddress | null>
  createAddress(input: CreateAddressInput): Promise<UserAddress>
  updateAddress(id: string, input: UpdateAddressInput): Promise<UserAddress>
  deleteAddress(id: string): Promise<boolean>
}
