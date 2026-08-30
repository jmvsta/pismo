export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'
export type OauthProvider = 'GOOGLE'

export interface UserSummary {
  id: string
  nickname: string
  avatarImageId: string | null
}

export interface UserOauthAccount {
  id: string
  provider: OauthProvider
  providerUserId: string
  email: string | null
  linkedAt: string
}

export interface User extends UserSummary {
  email: string
  dateOfBirth: string | null
  bio: string | null
  city: string | null
  countryCode: string | null
  role: UserRole
  status: UserStatus
  rulesAcceptedAt: string
  emailVerifiedAt: string | null
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
  oauthAccounts: UserOauthAccount[]
}

export interface UpdateProfileInput {
  nickname?: string
  bio?: string
  city?: string
  countryCode?: string
}

export interface RegisterInput {
  nickname: string
  email: string
  password: string
  dateOfBirth?: string
  acceptedRules: boolean
}

export interface LoginInput {
  email: string
  password: string
}
