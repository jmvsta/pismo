/**
 * QuestionnaireVersion.definition is an opaque JSON string on the GraphQL
 * schema (see back/src/main/resources/graphql/questionnaire.graphqls); this
 * is its actual shape, taken from the seeded registration questionnaire
 * (back/src/main/resources/db/migration/V014__seed_questionnaire_v1.sql).
 */
export interface QuestionnaireSectionDef {
  code: string
  title: string
}

export interface QuestionnaireOptionDef {
  key: string
  text: string
  free_text?: boolean
  photo_url?: string | null
}

export type QuestionnaireQuestionType = 'single' | 'single_or_free' | 'multi'

export interface QuestionnaireQuestionDef {
  key: string
  type: QuestionnaireQuestionType
  section: string
  text: string
  display?: 'photo'
  options: QuestionnaireOptionDef[]
}

export interface QuestionnaireDefinition {
  version: number
  sections: QuestionnaireSectionDef[]
  questions: QuestionnaireQuestionDef[]
}

export type QuestionnaireAnswerValue = string | string[]
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswerValue>
