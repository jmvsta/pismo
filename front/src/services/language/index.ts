import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlLanguageService } from './GraphqlLanguageService.ts'

export type { LanguageService } from './LanguageService.ts'
export type { Language, UserLanguage, LanguagePurpose, LanguageProficiency } from './types.ts'

export const languageService = new GraphqlLanguageService(graphqlClient)
