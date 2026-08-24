import type { UserSummary } from '../user/types.ts'

export type LanguagePurpose = 'WRITE' | 'RECEIVE' | 'LEARNING'
export type LanguageProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE'

export interface Language {
  code: string
  name: string
  nativeName: string
  position: number
  active: boolean
}

/** purpose: WRITE = can write letters in it, RECEIVE = wants letters in it, LEARNING = studying it. */
export interface UserLanguage {
  user: UserSummary
  language: Language
  purpose: LanguagePurpose
  proficiency: LanguageProficiency | null
  createdAt: string
}
