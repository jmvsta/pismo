import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlLettersService } from './GraphqlLettersService.ts'

export type { LettersService } from './LettersService.ts'
export type {
  Letter,
  LetterSummary,
  LetterStatus,
  LetterStatusEvent,
  LetterFeedback,
  CreateLetterInput,
  SubmitLetterFeedbackInput,
} from './types.ts'

export const lettersService = new GraphqlLettersService(graphqlClient)
