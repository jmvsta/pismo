import { useState } from 'react'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'
import type { UserAddress } from '../../services/address/index.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import { formatAddress } from './formatAddress.ts'

interface SendLetterDialogProps {
  connectionId: string
  recipientId: string
  recipientNickname: string
  recipientAddress: UserAddress
  onClose: () => void
  onSent: (letter: Letter) => void
}

function SendLetterDialog({
  connectionId,
  recipientId,
  recipientNickname,
  recipientAddress,
  onClose,
  onSent,
}: SendLetterDialogProps) {
  const language = useLanguageStore((state) => state.language)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmSent = async () => {
    setSending(true)
    setError(null)
    try {
      const sent = await lettersService.createLetter({ connectionId, recipientId })
      onSent(sent)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send this letter.')
      setSending(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h5>
            {uiText('sendLetterTitle', language)} {recipientNickname}
          </h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm">
            <span className="font-semibold">{uiText('sendLetterSendTo', language)} </span>
            {formatAddress(recipientAddress)}
          </div>

          {error && <p className="text-muted">{error}</p>}

          <div className="forum-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {uiText('cancel', language)}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmSent} disabled={sending}>
              {sending ? uiText('saving', language) : uiText('sendLetterConfirmSent', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendLetterDialog
