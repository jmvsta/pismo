import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlQuestionnaireService } from './GraphqlQuestionnaireService.ts'

export type { QuestionnaireService } from './QuestionnaireService.ts'
export type {
  QuestionnaireKind,
  QuestionnaireVersion,
  QuestionnaireVersionSummary,
  UserQuestionnaireResponse,
  SaveQuestionnaireResponseInput,
  SaveQuestionnaireTemplateInput,
} from './types.ts'

export const questionnaireService = new GraphqlQuestionnaireService(graphqlClient)
