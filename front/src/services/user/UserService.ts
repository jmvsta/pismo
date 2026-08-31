import type { LoginInput, RegisterInput, UpdateProfileInput, User, UserRole, UserStatus } from './types.ts'

export interface UserService {
  me(): Promise<User | null>
  getUser(id: string): Promise<User | null>
  updateProfile(input: UpdateProfileInput): Promise<User>
  updateAvatar(mimeType: string, imageBase64: string): Promise<User>
  register(input: RegisterInput): Promise<User>
  login(input: LoginInput): Promise<User>
  logout(): Promise<void>
  confirmEmail(code: string): Promise<User>
  resendVerificationCode(): Promise<void>
  users(): Promise<User[]>
  setUserStatus(userId: string, status: UserStatus): Promise<User>
  setUserRole(userId: string, role: UserRole): Promise<User>
}
