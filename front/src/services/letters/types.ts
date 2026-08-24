import type { Language } from '../language/types.ts'
import type { PenPalConnectionSummary } from '../matching/types.ts'
import type { QuestionnaireVersionSummary } from '../questionnaire/types.ts'
import type { UserSummary } from '../user/types.ts'

export type LetterStatus = 'DRAFT' | 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'LOST'

export interface LetterStatusEvent {
  id: string
  status: LetterStatus
  location: string | null
  note: string | null
  occurredAt: string
  createdAt: string
}

/** One rating per letter, left by its recipient once the letter is DELIVERED. */
export interface LetterFeedback {
  id: string
  rater: UserSummary
  letterScore: number
  senderScore: number | null
  comment: string | null
  questionnaireVersion: QuestionnaireVersionSummary | null
  experienceSurvey: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface LetterSummary {
  id: string
  status: LetterStatus
  trackingCode: string | null
  createdAt: string
}

/** Metadata only -- the letter itself travels by post, its contents are never stored. */
export interface Letter extends LetterSummary {
  connection: PenPalConnectionSummary
  sender: UserSummary
  recipient: UserSummary
  note: string | null
  language: Language | null
  sentAt: string | null
  deliveredAt: string | null
  updatedAt: string
  statusEvents: LetterStatusEvent[]
  feedback: LetterFeedback | null
}

export interface CreateLetterInput {
  connectionId: string
  recipientId: string
  languageCode?: string
  note?: string
}

export interface SubmitLetterFeedbackInput {
  letterId: string
  letterScore: number
  senderScore?: number
  comment?: string
  questionnaireVersionId?: string
  experienceSurvey?: string
}
