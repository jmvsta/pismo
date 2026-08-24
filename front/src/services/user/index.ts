import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlUserService } from './GraphqlUserService.ts'

export type { UserService } from './UserService.ts'
export type {
  User,
  UserSummary,
  UserOauthAccount,
  UserRole,
  UserStatus,
  OauthProvider,
  UpdateProfileInput,
  RegisterInput,
  LoginInput,
} from './types.ts'

export const userService = new GraphqlUserService(graphqlClient)
