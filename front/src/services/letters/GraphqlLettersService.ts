import type { GraphqlClient } from '../graphqlClient.ts'
import { LANGUAGE_FIELDS } from '../language/GraphqlLanguageService.ts'
import { PEN_PAL_CONNECTION_SUMMARY_FIELDS } from '../matching/GraphqlMatchingService.ts'
import { QUESTIONNAIRE_VERSION_SUMMARY_FIELDS } from '../questionnaire/GraphqlQuestionnaireService.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type {
  CreateLetterInput,
  Letter,
  LetterFeedback,
  LetterStatus,
  SubmitLetterFeedbackInput,
} from './types.ts'
import type { LettersService } from './LettersService.ts'

export const LETTER_SUMMARY_FIELDS = `
  id
  status
  trackingCode
  createdAt
`

const STATUS_EVENT_FIELDS = `
  id
  status
  location
  note
  occurredAt
  createdAt
`

const FEEDBACK_FIELDS = `
  id
  rater { ${USER_SUMMARY_FIELDS} }
  letterScore
  senderScore
  comment
  questionnaireVersion { ${QUESTIONNAIRE_VERSION_SUMMARY_FIELDS} }
  experienceSurvey
  isPublished
  createdAt
  updatedAt
`

const LETTER_FIELDS = `
  id
  connection { ${PEN_PAL_CONNECTION_SUMMARY_FIELDS} }
  sender { ${USER_SUMMARY_FIELDS} }
  recipient { ${USER_SUMMARY_FIELDS} }
  status
  trackingCode
  note
  language { ${LANGUAGE_FIELDS} }
  sentAt
  deliveredAt
  createdAt
  updatedAt
  statusEvents { ${STATUS_EVENT_FIELDS} }
  feedback { ${FEEDBACK_FIELDS} }
`

const LETTER_QUERY = `
  query GetLetter($id: ID!) {
    letter(id: $id) {
      ${LETTER_FIELDS}
    }
  }
`

const LETTERS_FOR_CONNECTION_QUERY = `
  query LettersForConnection($connectionId: ID!) {
    lettersForConnection(connectionId: $connectionId) {
      ${LETTER_FIELDS}
    }
  }
`

const SENT_LETTERS_QUERY = `
  query SentLetters {
    sentLetters {
      ${LETTER_FIELDS}
    }
  }
`

const RECEIVED_LETTERS_QUERY = `
  query ReceivedLetters {
    receivedLetters {
      ${LETTER_FIELDS}
    }
  }
`

const PENDING_INCOMING_LETTER_COUNT_QUERY = `
  query PendingIncomingLetterCount {
    pendingIncomingLetterCount
  }
`

const CONFIRM_LETTER_DELIVERY_MUTATION = `
  mutation ConfirmLetterDelivery($id: ID!, $code: String!) {
    confirmLetterDelivery(id: $id, code: $code) {
      ${LETTER_FIELDS}
    }
  }
`

const CREATE_LETTER_MUTATION = `
  mutation CreateLetter($input: CreateLetterInput!) {
    createLetter(input: $input) {
      ${LETTER_FIELDS}
    }
  }
`

const UPDATE_LETTER_STATUS_MUTATION = `
  mutation UpdateLetterStatus($id: ID!, $status: LetterStatus!, $location: String, $note: String) {
    updateLetterStatus(id: $id, status: $status, location: $location, note: $note) {
      ${LETTER_FIELDS}
    }
  }
`

const SUBMIT_LETTER_FEEDBACK_MUTATION = `
  mutation SubmitLetterFeedback($input: SubmitLetterFeedbackInput!) {
    submitLetterFeedback(input: $input) {
      ${FEEDBACK_FIELDS}
    }
  }
`

export class GraphqlLettersService implements LettersService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async letter(id: string): Promise<Letter | null> {
    const data = await this.client.request<{ letter: Letter | null }, { id: string }>(LETTER_QUERY, {
      id,
    })
    return data.letter
  }

  async lettersForConnection(connectionId: string): Promise<Letter[]> {
    const data = await this.client.request<
      { lettersForConnection: Letter[] },
      { connectionId: string }
    >(LETTERS_FOR_CONNECTION_QUERY, { connectionId })
    return data.lettersForConnection
  }

  async sentLetters(): Promise<Letter[]> {
    const data = await this.client.request<{ sentLetters: Letter[] }>(SENT_LETTERS_QUERY)
    return data.sentLetters
  }

  async receivedLetters(): Promise<Letter[]> {
    const data = await this.client.request<{ receivedLetters: Letter[] }>(RECEIVED_LETTERS_QUERY)
    return data.receivedLetters
  }

  async pendingIncomingLetterCount(): Promise<number> {
    const data = await this.client.request<{ pendingIncomingLetterCount: number }>(
      PENDING_INCOMING_LETTER_COUNT_QUERY,
    )
    return data.pendingIncomingLetterCount
  }

  async createLetter(input: CreateLetterInput): Promise<Letter> {
    const data = await this.client.request<{ createLetter: Letter }, { input: CreateLetterInput }>(
      CREATE_LETTER_MUTATION,
      { input },
    )
    return data.createLetter
  }

  async updateLetterStatus(
    id: string,
    status: LetterStatus,
    location?: string,
    note?: string,
  ): Promise<Letter> {
    const data = await this.client.request<
      { updateLetterStatus: Letter },
      { id: string; status: LetterStatus; location?: string; note?: string }
    >(UPDATE_LETTER_STATUS_MUTATION, { id, status, location, note })
    return data.updateLetterStatus
  }

  async confirmLetterDelivery(id: string, code: string): Promise<Letter> {
    const data = await this.client.request<{ confirmLetterDelivery: Letter }, { id: string; code: string }>(
      CONFIRM_LETTER_DELIVERY_MUTATION,
      { id, code },
    )
    return data.confirmLetterDelivery
  }

  async submitLetterFeedback(input: SubmitLetterFeedbackInput): Promise<LetterFeedback> {
    const data = await this.client.request<
      { submitLetterFeedback: LetterFeedback },
      { input: SubmitLetterFeedbackInput }
    >(SUBMIT_LETTER_FEEDBACK_MUTATION, { input })
    return data.submitLetterFeedback
  }
}
