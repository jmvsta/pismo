import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlAddressService } from './GraphqlAddressService.ts'

export type { AddressService } from './AddressService.ts'
export type {
  UserAddress,
  ConnectionAddressConsent,
  AddressConsentStatus,
  CreateAddressInput,
  UpdateAddressInput,
} from './types.ts'

export const addressService = new GraphqlAddressService(graphqlClient)
