import type { UserSummary } from '../user/types.ts'

export type QuestionnaireKind = 'REGISTRATION' | 'EXPERIENCE'

export interface QuestionnaireVersionSummary {
  id: string
  kind: QuestionnaireKind
  version: number
  isActive: boolean
  createdAt: string
}

/** definition is the JSON document described in questionnaire_versions.definition: {version, sections, questions}. */
export interface QuestionnaireVersion extends QuestionnaireVersionSummary {
  definition: string
}

/** answers is a JSON object keyed by question key, e.g. {"q01_ideal_now": "terrace_book_coffee"}. */
export interface UserQuestionnaireResponse {
  id: string
  user: UserSummary
  questionnaireVersion: QuestionnaireVersion
  answers: string
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveQuestionnaireResponseInput {
  questionnaireVersionId: string
  answers: string
}

export interface SaveQuestionnaireTemplateInput {
  kind: QuestionnaireKind
  definition: string
}
