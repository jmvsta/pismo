import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type { Language, LanguageProficiency, LanguagePurpose, UserLanguage } from './types.ts'
import type { LanguageService } from './LanguageService.ts'

export const LANGUAGE_FIELDS = `
  code
  name
  nativeName
  position
  active
`

const USER_LANGUAGE_FIELDS = `
  user { ${USER_SUMMARY_FIELDS} }
  language { ${LANGUAGE_FIELDS} }
  purpose
  proficiency
  createdAt
`

const LANGUAGES_QUERY = `
  query Languages($activeOnly: Boolean) {
    languages(activeOnly: $activeOnly) {
      ${LANGUAGE_FIELDS}
    }
  }
`

const MY_LANGUAGES_QUERY = `
  query MyLanguages {
    myLanguages {
      ${USER_LANGUAGE_FIELDS}
    }
  }
`

const SET_USER_LANGUAGE_MUTATION = `
  mutation SetUserLanguage($languageCode: String!, $purpose: LanguagePurpose!, $proficiency: LanguageProficiency) {
    setUserLanguage(languageCode: $languageCode, purpose: $purpose, proficiency: $proficiency) {
      ${USER_LANGUAGE_FIELDS}
    }
  }
`

const REMOVE_USER_LANGUAGE_MUTATION = `
  mutation RemoveUserLanguage($languageCode: String!, $purpose: LanguagePurpose!) {
    removeUserLanguage(languageCode: $languageCode, purpose: $purpose)
  }
`

export class GraphqlLanguageService implements LanguageService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async languages(activeOnly?: boolean): Promise<Language[]> {
    const data = await this.client.request<{ languages: Language[] }, { activeOnly?: boolean }>(
      LANGUAGES_QUERY,
      { activeOnly },
    )
    return data.languages
  }

  async myLanguages(): Promise<UserLanguage[]> {
    const data = await this.client.request<{ myLanguages: UserLanguage[] }>(MY_LANGUAGES_QUERY)
    return data.myLanguages
  }

  async setUserLanguage(
    languageCode: string,
    purpose: LanguagePurpose,
    proficiency?: LanguageProficiency,
  ): Promise<UserLanguage> {
    const data = await this.client.request<
      { setUserLanguage: UserLanguage },
      { languageCode: string; purpose: LanguagePurpose; proficiency?: LanguageProficiency }
    >(SET_USER_LANGUAGE_MUTATION, { languageCode, purpose, proficiency })
    return data.setUserLanguage
  }

  async removeUserLanguage(languageCode: string, purpose: LanguagePurpose): Promise<boolean> {
    const data = await this.client.request<
      { removeUserLanguage: boolean },
      { languageCode: string; purpose: LanguagePurpose }
    >(REMOVE_USER_LANGUAGE_MUTATION, { languageCode, purpose })
    return data.removeUserLanguage
  }
}
