import type { Letter, LetterStatus } from '../../services/letters/index.ts'

export interface LetterRow {
  id: string
  penPalName: string
  direction: 'outgoing' | 'incoming'
  status: LetterStatus
  since: string
}

export function toLetterRows(sent: Letter[], received: Letter[]): LetterRow[] {
  const outgoing: LetterRow[] = sent.map((letter) => ({
    id: letter.id,
    penPalName: letter.recipient.nickname,
    direction: 'outgoing',
    status: letter.status,
    since: letter.createdAt,
  }))
  const incoming: LetterRow[] = received.map((letter) => ({
    id: letter.id,
    penPalName: letter.sender.nickname,
    direction: 'incoming',
    status: letter.status,
    since: letter.createdAt,
  }))
  return [...outgoing, ...incoming].sort((a, b) => b.since.localeCompare(a.since))
}
