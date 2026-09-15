import { useState, type FormEvent } from 'react'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'

interface ConfirmDeliveryDialogProps {
  letterId: string
  senderNickname: string
  onClose: () => void
  onConfirmed: (letter: Letter) => void
}

function ConfirmDeliveryDialog({ letterId, senderNickname, onClose, onConfirmed }: ConfirmDeliveryDialogProps) {
  const language = useLanguageStore((state) => state.language)
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
          <h5>
            {uiText('confirmDeliveryTitle', language)} {senderNickname}
          </h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="text-muted text-sm">{uiText('confirmDeliveryHint', language)}</p>

        <div className="field">
          <label htmlFor="confirm-delivery-code">{uiText('confirmDeliveryCode', language)}</label>
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
            {uiText('cancel', language)}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || code.trim() === ''}>
            {submitting ? uiText('confirmDeliveryConfirming', language) : uiText('confirmDeliverySubmit', language)}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConfirmDeliveryDialog
