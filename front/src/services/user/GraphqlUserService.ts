import type { GraphqlClient } from '../graphqlClient.ts'
import type { UpdateProfileInput, User } from './types.ts'
import type { UserService } from './UserService.ts'

export const USER_SUMMARY_FIELDS = `
  id
  nickname
  avatarUrl
`

export const USER_FIELDS = `
  ${USER_SUMMARY_FIELDS}
  email
  dateOfBirth
  bio
  city
  countryCode
  role
  status
  rulesAcceptedAt
  emailVerifiedAt
  lastSeenAt
  createdAt
  updatedAt
  oauthAccounts {
    id
    provider
    providerUserId
    email
    linkedAt
  }
`

const ME_QUERY = `
  query Me {
    me {
      ${USER_FIELDS}
    }
  }
`

const USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      ${USER_FIELDS}
    }
  }
`

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ${USER_FIELDS}
    }
  }
`

export class GraphqlUserService implements UserService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async me(): Promise<User | null> {
    const data = await this.client.request<{ me: User | null }>(ME_QUERY)
    return data.me
  }

  async getUser(id: string): Promise<User | null> {
    const data = await this.client.request<{ user: User | null }, { id: string }>(USER_QUERY, { id })
    return data.user
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const data = await this.client.request<
      { updateProfile: User },
      { input: UpdateProfileInput }
    >(UPDATE_PROFILE_MUTATION, { input })
    return data.updateProfile
  }
}
