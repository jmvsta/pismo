import type { GraphqlClient } from '../graphqlClient.ts'
import type { LoginInput, RegisterInput, UpdateProfileInput, User, UserRole, UserStatus } from './types.ts'
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

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ${USER_FIELDS}
      authToken
    }
  }
`

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ${USER_FIELDS}
      authToken
    }
  }
`

const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`

const USERS_QUERY = `
  query Users {
    users {
      ${USER_FIELDS}
    }
  }
`

const SET_USER_STATUS_MUTATION = `
  mutation SetUserStatus($userId: ID!, $status: UserStatus!) {
    setUserStatus(userId: $userId, status: $status) {
      ${USER_FIELDS}
    }
  }
`

const SET_USER_ROLE_MUTATION = `
  mutation SetUserRole($userId: ID!, $role: UserRole!) {
    setUserRole(userId: $userId, role: $role) {
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

  async register(input: RegisterInput): Promise<User> {
    const data = await this.client.request<
      { register: User & { authToken: string | null } },
      { input: RegisterInput }
    >(REGISTER_MUTATION, { input })
    this.client.setAuthToken(data.register.authToken)
    return data.register
  }

  async login(input: LoginInput): Promise<User> {
    const data = await this.client.request<
      { login: User & { authToken: string | null } },
      { input: LoginInput }
    >(LOGIN_MUTATION, { input })
    this.client.setAuthToken(data.login.authToken)
    return data.login
  }

  async logout(): Promise<void> {
    try {
      await this.client.request<{ logout: boolean }>(LOGOUT_MUTATION)
    } finally {
      this.client.setAuthToken(null)
    }
  }

  async users(): Promise<User[]> {
    const data = await this.client.request<{ users: User[] }>(USERS_QUERY)
    return data.users
  }

  async setUserStatus(userId: string, status: UserStatus): Promise<User> {
    const data = await this.client.request<
      { setUserStatus: User },
      { userId: string; status: UserStatus }
    >(SET_USER_STATUS_MUTATION, { userId, status })
    return data.setUserStatus
  }

  async setUserRole(userId: string, role: UserRole): Promise<User> {
    const data = await this.client.request<
      { setUserRole: User },
      { userId: string; role: UserRole }
    >(SET_USER_ROLE_MUTATION, { userId, role })
    return data.setUserRole
  }
}
