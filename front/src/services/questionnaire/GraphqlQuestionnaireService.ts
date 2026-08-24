import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type {
  QuestionnaireKind,
  QuestionnaireVersion,
  SaveQuestionnaireResponseInput,
  UserQuestionnaireResponse,
} from './types.ts'
import type { QuestionnaireService } from './QuestionnaireService.ts'

export const QUESTIONNAIRE_VERSION_SUMMARY_FIELDS = `
  id
  kind
  version
  isActive
  createdAt
`

const QUESTIONNAIRE_VERSION_FIELDS = `
  ${QUESTIONNAIRE_VERSION_SUMMARY_FIELDS}
  definition
`

const RESPONSE_FIELDS = `
  id
  user { ${USER_SUMMARY_FIELDS} }
  questionnaireVersion { ${QUESTIONNAIRE_VERSION_FIELDS} }
  answers
  submittedAt
  createdAt
  updatedAt
`

const ACTIVE_QUESTIONNAIRE_QUERY = `
  query ActiveQuestionnaire($kind: QuestionnaireKind!) {
    activeQuestionnaire(kind: $kind) {
      ${QUESTIONNAIRE_VERSION_FIELDS}
    }
  }
`

const QUESTIONNAIRE_VERSION_QUERY = `
  query QuestionnaireVersion($id: ID!) {
    questionnaireVersion(id: $id) {
      ${QUESTIONNAIRE_VERSION_FIELDS}
    }
  }
`

const MY_QUESTIONNAIRE_RESPONSE_QUERY = `
  query MyQuestionnaireResponse($questionnaireVersionId: ID!) {
    myQuestionnaireResponse(questionnaireVersionId: $questionnaireVersionId) {
      ${RESPONSE_FIELDS}
    }
  }
`

const SAVE_QUESTIONNAIRE_RESPONSE_MUTATION = `
  mutation SaveQuestionnaireResponse($input: SaveQuestionnaireResponseInput!) {
    saveQuestionnaireResponse(input: $input) {
      ${RESPONSE_FIELDS}
    }
  }
`

const SUBMIT_QUESTIONNAIRE_RESPONSE_MUTATION = `
  mutation SubmitQuestionnaireResponse($id: ID!) {
    submitQuestionnaireResponse(id: $id) {
      ${RESPONSE_FIELDS}
    }
  }
`

export class GraphqlQuestionnaireService implements QuestionnaireService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async activeQuestionnaire(kind: QuestionnaireKind): Promise<QuestionnaireVersion | null> {
    const data = await this.client.request<
      { activeQuestionnaire: QuestionnaireVersion | null },
      { kind: QuestionnaireKind }
    >(ACTIVE_QUESTIONNAIRE_QUERY, { kind })
    return data.activeQuestionnaire
  }

  async questionnaireVersion(id: string): Promise<QuestionnaireVersion | null> {
    const data = await this.client.request<
      { questionnaireVersion: QuestionnaireVersion | null },
      { id: string }
    >(QUESTIONNAIRE_VERSION_QUERY, { id })
    return data.questionnaireVersion
  }

  async myQuestionnaireResponse(
    questionnaireVersionId: string,
  ): Promise<UserQuestionnaireResponse | null> {
    const data = await this.client.request<
      { myQuestionnaireResponse: UserQuestionnaireResponse | null },
      { questionnaireVersionId: string }
    >(MY_QUESTIONNAIRE_RESPONSE_QUERY, { questionnaireVersionId })
    return data.myQuestionnaireResponse
  }

  async saveQuestionnaireResponse(
    input: SaveQuestionnaireResponseInput,
  ): Promise<UserQuestionnaireResponse> {
    const data = await this.client.request<
      { saveQuestionnaireResponse: UserQuestionnaireResponse },
      { input: SaveQuestionnaireResponseInput }
    >(SAVE_QUESTIONNAIRE_RESPONSE_MUTATION, { input })
    return data.saveQuestionnaireResponse
  }

  async submitQuestionnaireResponse(id: string): Promise<UserQuestionnaireResponse> {
    const data = await this.client.request<
      { submitQuestionnaireResponse: UserQuestionnaireResponse },
      { id: string }
    >(SUBMIT_QUESTIONNAIRE_RESPONSE_MUTATION, { id })
    return data.submitQuestionnaireResponse
  }
}
