import type {
  QuestionnaireKind,
  QuestionnaireVersion,
  SaveQuestionnaireResponseInput,
  UserQuestionnaireResponse,
} from './types.ts'

export interface QuestionnaireService {
  activeQuestionnaire(kind: QuestionnaireKind): Promise<QuestionnaireVersion | null>
  questionnaireVersion(id: string): Promise<QuestionnaireVersion | null>
  myQuestionnaireResponse(questionnaireVersionId: string): Promise<UserQuestionnaireResponse | null>
  saveQuestionnaireResponse(input: SaveQuestionnaireResponseInput): Promise<UserQuestionnaireResponse>
  submitQuestionnaireResponse(id: string): Promise<UserQuestionnaireResponse>
}
