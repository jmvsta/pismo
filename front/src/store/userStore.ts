import { create } from 'zustand'
import { userService } from '../services/user/index.ts'
import type { User } from '../services/user/index.ts'

type UserStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UserState {
  currentUser: User | null
  status: UserStatus
  error: string | null
  loadCurrentUser: () => Promise<void>
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
}))
