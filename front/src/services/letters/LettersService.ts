import type {
  CreateLetterInput,
  Letter,
  LetterFeedback,
  LetterStatus,
  SubmitLetterFeedbackInput,
} from './types.ts'

export interface LettersService {
  letter(id: string): Promise<Letter | null>
  lettersForConnection(connectionId: string): Promise<Letter[]>
  sentLetters(): Promise<Letter[]>
  receivedLetters(): Promise<Letter[]>
  pendingIncomingLetterCount(): Promise<number>
  createLetter(input: CreateLetterInput): Promise<Letter>
  updateLetterStatus(
    id: string,
    status: LetterStatus,
    location?: string,
    note?: string,
  ): Promise<Letter>
  confirmLetterDelivery(id: string, code: string): Promise<Letter>
  submitLetterFeedback(input: SubmitLetterFeedbackInput): Promise<LetterFeedback>
}
