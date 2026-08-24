import type { GraphqlClient } from '../graphqlClient.ts'
import { PEN_PAL_CONNECTION_SUMMARY_FIELDS } from '../matching/GraphqlMatchingService.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type {
  ConnectionAddressConsent,
  CreateAddressInput,
  UpdateAddressInput,
  UserAddress,
} from './types.ts'
import type { AddressService } from './AddressService.ts'

const ADDRESS_FIELDS = `
  id
  recipientName
  streetLine1
  streetLine2
  city
  region
  postalCode
  countryCode
  isPrimary
  verifiedAt
  createdAt
  updatedAt
`

const CONSENT_FIELDS = `
  id
  connection { ${PEN_PAL_CONNECTION_SUMMARY_FIELDS} }
  grantor { ${USER_SUMMARY_FIELDS} }
  address { ${ADDRESS_FIELDS} }
  status
  grantedAt
  revokedAt
`

const MY_ADDRESSES_QUERY = `
  query MyAddresses {
    myAddresses {
      ${ADDRESS_FIELDS}
    }
  }
`

const ADDRESS_CONSENTS_FOR_CONNECTION_QUERY = `
  query AddressConsentsForConnection($connectionId: ID!) {
    addressConsentsForConnection(connectionId: $connectionId) {
      ${CONSENT_FIELDS}
    }
  }
`

const CREATE_ADDRESS_MUTATION = `
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      ${ADDRESS_FIELDS}
    }
  }
`

const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      ${ADDRESS_FIELDS}
    }
  }
`

const DELETE_ADDRESS_MUTATION = `
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`

const GRANT_ADDRESS_CONSENT_MUTATION = `
  mutation GrantAddressConsent($connectionId: ID!, $addressId: ID!) {
    grantAddressConsent(connectionId: $connectionId, addressId: $addressId) {
      ${CONSENT_FIELDS}
    }
  }
`

const REVOKE_ADDRESS_CONSENT_MUTATION = `
  mutation RevokeAddressConsent($connectionId: ID!) {
    revokeAddressConsent(connectionId: $connectionId) {
      ${CONSENT_FIELDS}
    }
  }
`

export class GraphqlAddressService implements AddressService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async myAddresses(): Promise<UserAddress[]> {
    const data = await this.client.request<{ myAddresses: UserAddress[] }>(MY_ADDRESSES_QUERY)
    return data.myAddresses
  }

  async addressConsentsForConnection(connectionId: string): Promise<ConnectionAddressConsent[]> {
    const data = await this.client.request<
      { addressConsentsForConnection: ConnectionAddressConsent[] },
      { connectionId: string }
    >(ADDRESS_CONSENTS_FOR_CONNECTION_QUERY, { connectionId })
    return data.addressConsentsForConnection
  }

  async createAddress(input: CreateAddressInput): Promise<UserAddress> {
    const data = await this.client.request<
      { createAddress: UserAddress },
      { input: CreateAddressInput }
    >(CREATE_ADDRESS_MUTATION, { input })
    return data.createAddress
  }

  async updateAddress(id: string, input: UpdateAddressInput): Promise<UserAddress> {
    const data = await this.client.request<
      { updateAddress: UserAddress },
      { id: string; input: UpdateAddressInput }
    >(UPDATE_ADDRESS_MUTATION, { id, input })
    return data.updateAddress
  }

  async deleteAddress(id: string): Promise<boolean> {
    const data = await this.client.request<{ deleteAddress: boolean }, { id: string }>(
      DELETE_ADDRESS_MUTATION,
      { id },
    )
    return data.deleteAddress
  }

  async grantAddressConsent(
    connectionId: string,
    addressId: string,
  ): Promise<ConnectionAddressConsent> {
    const data = await this.client.request<
      { grantAddressConsent: ConnectionAddressConsent },
      { connectionId: string; addressId: string }
    >(GRANT_ADDRESS_CONSENT_MUTATION, { connectionId, addressId })
    return data.grantAddressConsent
  }

  async revokeAddressConsent(connectionId: string): Promise<ConnectionAddressConsent> {
    const data = await this.client.request<
      { revokeAddressConsent: ConnectionAddressConsent },
      { connectionId: string }
    >(REVOKE_ADDRESS_CONSENT_MUTATION, { connectionId })
    return data.revokeAddressConsent
  }
}
