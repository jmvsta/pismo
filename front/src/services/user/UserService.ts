import type { LoginInput, RegisterInput, UpdateProfileInput, User } from './types.ts'

export interface UserService {
  me(): Promise<User | null>
  getUser(id: string): Promise<User | null>
  updateProfile(input: UpdateProfileInput): Promise<User>
  register(input: RegisterInput): Promise<User>
  login(input: LoginInput): Promise<User>
  logout(): Promise<void>
}
