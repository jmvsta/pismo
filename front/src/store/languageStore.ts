import { create } from 'zustand'

export type Language = 'EN' | 'RU' | 'SRB'

const STORAGE_KEY = 'pismo-language'

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'RU' || stored === 'SRB' ? stored : 'EN'
  } catch {
    return 'EN'
  }
}

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: readStoredLanguage(),

  setLanguage: (language) => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore storage failures (private browsing, disabled storage, etc.)
    }
    set({ language })
  },
}))
