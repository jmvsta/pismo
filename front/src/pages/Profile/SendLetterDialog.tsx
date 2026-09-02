import { useEffect, useRef, useState } from 'react'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'
import type { UserAddress } from '../../services/address/index.ts'

interface SendLetterDialogProps {
  connectionId: string
  recipientId: string
  recipientNickname: string
  recipientAddress: UserAddress | null
  existingLetter: Letter | null
  onClose: () => void
  onDraftCreated: (letter: Letter) => void
  onSent: (letter: Letter) => void
}

function formatAddress(address: UserAddress): string {
  return [address.recipientName, address.streetLine1, address.streetLine2, address.city, address.region, address.postalCode, address.countryCode]
    .filter(Boolean)
    .join(', ')
}

function SendLetterDialog({
  connectionId,
  recipientId,
  recipientNickname,
  recipientAddress,
  existingLetter,
  onClose,
  onDraftCreated,
  onSent,
}: SendLetterDialogProps) {
  const [letter, setLetter] = useState<Letter | null>(existingLetter)
  const [loading, setLoading] = useState(existingLetter === null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const onDraftCreatedRef = useRef(onDraftCreated)
  useEffect(() => {
    onDraftCreatedRef.current = onDraftCreated
  })

  useEffect(() => {
    if (existingLetter) return
    let cancelled = false
    lettersService
      .createLetter({ connectionId, recipientId })
      .then((created) => {
        if (!cancelled) {
          setLetter(created)
          onDraftCreatedRef.current(created)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not start this letter.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [connectionId, recipientId, existingLetter])

  const handleCopyCode = () => {
    if (!letter?.trackingCode) return
    navigator.clipboard?.writeText(letter.trackingCode).then(() => setCopied(true))
  }

  const handleConfirmSent = async () => {
    if (!letter) return
    setConfirming(true)
    setError(null)
    try {
      const sent = await lettersService.updateLetterStatus(letter.id, 'SENT')
      onSent(sent)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark this letter as sent.')
      setConfirming(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h5>Send a letter to {recipientNickname}</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && <p className="text-muted">Preparing your letter…</p>}

        {!loading && letter && (
          <div className="flex flex-col gap-3">
            <p className="text-muted text-sm">
              Write this code inside the letter — {recipientNickname} will enter it once it arrives to confirm
              delivery.
            </p>

            <div className="flex items-center gap-3 border border-[var(--color-divider)] p-3">
              <span className="text-2xl font-bold tracking-widest">{letter.trackingCode}</span>
              <button type="button" className="btn btn-ghost" onClick={handleCopyCode}>
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>

            <div className="text-sm">
              <span className="font-semibold">Send to: </span>
              {recipientAddress ? (
                formatAddress(recipientAddress)
              ) : (
                <span className="text-muted">
                  {recipientNickname} hasn't shared their address for this connection yet — ask them to enable
                  address sharing first.
                </span>
              )}
            </div>

            {error && <p className="text-muted">{error}</p>}

            <div className="forum-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmSent} disabled={confirming}>
                {confirming ? 'Saving…' : "I've written and sent it →"}
              </button>
            </div>
          </div>
        )}

        {!loading && !letter && error && <p className="text-muted">{error}</p>}
      </div>
    </div>
  )
}

export default SendLetterDialog
