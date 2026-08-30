import { create } from 'zustand'
import { userService } from '../services/user/index.ts'
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from '../services/user/index.ts'

type UserStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UserState {
  currentUser: User | null
  status: UserStatus
  error: string | null
  loadCurrentUser: () => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<void>
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to load the current user.'
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  status: 'idle',
  error: null,

  loadCurrentUser: async () => {
    set({ status: 'loading', error: null })
    try {
      const currentUser = await userService.me()
      set({ currentUser, status: currentUser ? 'ready' : 'error', error: currentUser ? null : 'Not signed in.' })
    } catch (error) {
      set({ status: 'error', error: toErrorMessage(error) })
    }
  },

  register: async (input) => {
    set({ status: 'loading', error: null })
    try {
      const currentUser = await userService.register(input)
      set({ currentUser, status: 'ready', error: null })
    } catch (error) {
      set({ status: 'error', error: toErrorMessage(error) })
      throw error
    }
  },

  login: async (input) => {
    set({ status: 'loading', error: null })
    try {
      const currentUser = await userService.login(input)
      set({ currentUser, status: 'ready', error: null })
    } catch (error) {
      set({ status: 'error', error: toErrorMessage(error) })
      throw error
    }
  },

  logout: async () => {
    await userService.logout()
    set({ currentUser: null, status: 'idle', error: null })
  },

  updateProfile: async (input) => {
    const currentUser = await userService.updateProfile(input)
    set({ currentUser })
  },
}))
