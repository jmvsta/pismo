import { useState, type FormEvent } from 'react'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'

interface SendLetterDialogProps {
  connectionId: string
  recipientId: string
  recipientNickname: string
  onClose: () => void
  onSent: (letter: Letter) => void
}

function SendLetterDialog({ connectionId, recipientId, recipientNickname, onClose, onSent }: SendLetterDialogProps) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const letter = await lettersService.createLetter({ connectionId, recipientId, note: note || undefined })
      const sent = await lettersService.updateLetterStatus(letter.id, 'SENT')
      onSent(sent)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record this letter.')
      setSubmitting(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <form className="forum-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="forum-modal-header">
          <h5>Send the first letter to {recipientNickname}</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="text-muted text-sm">
          The letter itself travels by post — this just records that you've written and sent it, and reveals your
          pen pal's address to you once they've shared it.
        </p>

        <div className="field">
          <label htmlFor="send-letter-note">Note to yourself (optional)</label>
          <textarea
            id="send-letter-note"
            className="input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. tracking code, what you wrote about…"
          />
        </div>

        {error && <p className="text-muted">{error}</p>}

        <div className="forum-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending…' : "I've sent it →"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SendLetterDialog
