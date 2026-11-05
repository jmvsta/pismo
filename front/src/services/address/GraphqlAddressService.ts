import type { GraphqlClient } from '../graphqlClient.ts'
import type {
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

const MY_ADDRESSES_QUERY = `
  query MyAddresses {
    myAddresses {
      ${ADDRESS_FIELDS}
    }
  }
`

const PEN_PAL_ADDRESS_QUERY = `
  query PenPalAddress($connectionId: ID!) {
    penPalAddress(connectionId: $connectionId) {
      ${ADDRESS_FIELDS}
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

export class GraphqlAddressService implements AddressService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async myAddresses(): Promise<UserAddress[]> {
    const data = await this.client.request<{ myAddresses: UserAddress[] }>(MY_ADDRESSES_QUERY)
    return data.myAddresses
  }

  async penPalAddress(connectionId: string): Promise<UserAddress | null> {
    const data = await this.client.request<{ penPalAddress: UserAddress | null }, { connectionId: string }>(
      PEN_PAL_ADDRESS_QUERY,
      { connectionId },
    )
    return data.penPalAddress
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

}
