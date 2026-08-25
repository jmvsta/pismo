import type {
  QuestionnaireKind,
  QuestionnaireVersion,
  SaveQuestionnaireResponseInput,
  SaveQuestionnaireTemplateInput,
  UserQuestionnaireResponse,
} from './types.ts'

export interface QuestionnaireService {
  activeQuestionnaire(kind: QuestionnaireKind): Promise<QuestionnaireVersion | null>
  questionnaireVersion(id: string): Promise<QuestionnaireVersion | null>
  questionnaireVersions(kind: QuestionnaireKind): Promise<QuestionnaireVersion[]>
  myQuestionnaireResponse(questionnaireVersionId: string): Promise<UserQuestionnaireResponse | null>
  saveQuestionnaireResponse(input: SaveQuestionnaireResponseInput): Promise<UserQuestionnaireResponse>
  submitQuestionnaireResponse(id: string): Promise<UserQuestionnaireResponse>
  saveQuestionnaireTemplate(input: SaveQuestionnaireTemplateInput): Promise<QuestionnaireVersion>
}
