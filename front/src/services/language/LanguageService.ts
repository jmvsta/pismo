import type { Language, LanguageProficiency, LanguagePurpose, UserLanguage } from './types.ts'

export interface LanguageService {
  languages(activeOnly?: boolean): Promise<Language[]>
  myLanguages(): Promise<UserLanguage[]>
  setUserLanguage(
    languageCode: string,
    purpose: LanguagePurpose,
    proficiency?: LanguageProficiency,
  ): Promise<UserLanguage>
  removeUserLanguage(languageCode: string, purpose: LanguagePurpose): Promise<boolean>
}
