import { useState, type FormEvent } from 'react'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'

interface ConfirmDeliveryDialogProps {
  letterId: string
  senderNickname: string
  onClose: () => void
  onConfirmed: (letter: Letter) => void
}

function ConfirmDeliveryDialog({ letterId, senderNickname, onClose, onConfirmed }: ConfirmDeliveryDialogProps) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting || code.trim() === '') return
    setSubmitting(true)
    setError(null)
    try {
      const letter = await lettersService.confirmLetterDelivery(letterId, code.trim())
      onConfirmed(letter)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm delivery.')
      setSubmitting(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <form className="forum-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="forum-modal-header">
          <h5>Confirm delivery from {senderNickname}</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="text-muted text-sm">Enter the code written inside the letter you received.</p>

        <div className="field">
          <label htmlFor="confirm-delivery-code">Code</label>
          <input
            id="confirm-delivery-code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
          />
        </div>

        {error && <p className="text-muted">{error}</p>}

        <div className="forum-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || code.trim() === ''}>
            {submitting ? 'Confirming…' : 'Confirm delivery →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConfirmDeliveryDialog
