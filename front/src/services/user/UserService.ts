import type { UpdateProfileInput, User } from './types.ts'

export interface UserService {
  me(): Promise<User | null>
  getUser(id: string): Promise<User | null>
  updateProfile(input: UpdateProfileInput): Promise<User>
}
