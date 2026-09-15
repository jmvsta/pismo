import { useEffect, useState } from 'react'
import type { PenPalConnection } from '../../services/matching/index.ts'
import type { Letter } from '../../services/letters/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import { addressService } from '../../services/address/index.ts'
import type { ConnectionAddressConsent } from '../../services/address/index.ts'
import SendLetterDialog from '../../pages/Profile/SendLetterDialog.tsx'
import ConfirmDeliveryDialog from '../../pages/Profile/ConfirmDeliveryDialog.tsx'

const OPEN_STATUSES = new Set(['DRAFT', 'SENT', 'IN_TRANSIT'])

interface PenPalLetterActionProps {
  connection: PenPalConnection
  currentUserId: string
  otherId: string
  otherNickname: string
}

function otherUserIdFor(connection: PenPalConnection, senderId: string): string {
  return senderId === connection.userA.id ? connection.userB.id : connection.userA.id
}

function PenPalLetterAction({ connection, currentUserId, otherId, otherNickname }: PenPalLetterActionProps) {
  const [letters, setLetters] = useState<Letter[]>([])
  const [otherConsent, setOtherConsent] = useState<ConnectionAddressConsent | null>(null)
  const [loading, setLoading] = useState(true)
  const [letterDialogOpen, setLetterDialogOpen] = useState(false)
  const [existingDraft, setExistingDraft] = useState<Letter | null>(null)
  const [confirmingLetter, setConfirmingLetter] = useState<Letter | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      lettersService.lettersForConnection(connection.id),
      addressService.addressConsentsForConnection(connection.id),
    ])
      .then(([fetchedLetters, consents]) => {
        if (cancelled) return
        setLetters(fetchedLetters)
        setOtherConsent(consents.find((c) => c.grantor.id !== currentUserId) ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load letters.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [connection.id, currentUserId])

  const replaceLetter = (letter: Letter) => {
    setLetters((prev) => [letter, ...prev.filter((existing) => existing.id !== letter.id)])
  }

  if (loading) return null
  if (error) return <span className="text-muted match-card-error">{error}</span>

  const isModeratorLetterRequest = connection.request?.source === 'MODERATOR_LETTER_REQUEST'
  const moderatorId = connection.request?.addressee.id

  const openLetter = letters.find((letter) => OPEN_STATUSES.has(letter.status)) ?? null
  const deliveredLetters = letters.filter((letter) => letter.status === 'DELIVERED')
  const lastDelivered = deliveredLetters[0] ?? null
  const eligibleSenderId = lastDelivered
    ? otherUserIdFor(connection, lastDelivered.sender.id)
    : isModeratorLetterRequest && moderatorId
      ? moderatorId
      : currentUserId
  const isMyTurnToSend = !openLetter && eligibleSenderId === currentUserId
  const recipientAddress = otherConsent?.status === 'GRANTED' ? otherConsent.address : null

  return (
    <>
      {openLetter && openLetter.sender.id === currentUserId && (
        openLetter.status === 'DRAFT' ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setExistingDraft(openLetter)
              setLetterDialogOpen(true)
            }}
          >
            Resume sending
          </button>
        ) : (
          <span className="text-muted match-card-waiting">
            Sent — waiting for {otherNickname} to confirm delivery. Code: <strong>{openLetter.trackingCode}</strong>
          </span>
        )
      )}

      {openLetter && openLetter.recipient.id === currentUserId && openLetter.status === 'DRAFT' && (
        <span className="text-muted match-card-waiting">Waiting for {otherNickname} to finish and send their letter.</span>
      )}

      {openLetter && openLetter.recipient.id === currentUserId && openLetter.status !== 'DRAFT' && (
        <button type="button" className="btn btn-primary" onClick={() => setConfirmingLetter(openLetter)}>
          Confirm delivery
        </button>
      )}

      {!openLetter && isMyTurnToSend && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setExistingDraft(null)
            setLetterDialogOpen(true)
          }}
        >
          {deliveredLetters.length === 0 ? 'Send first letter' : 'Reply'}
        </button>
      )}

      {!openLetter && !isMyTurnToSend && (
        <span className="text-muted match-card-waiting">Waiting for {otherNickname} to write.</span>
      )}

      {letterDialogOpen && (
        <SendLetterDialog
          connectionId={connection.id}
          recipientId={otherId}
          recipientNickname={otherNickname}
          recipientAddress={recipientAddress}
          existingLetter={existingDraft}
          onClose={() => setLetterDialogOpen(false)}
          onDraftCreated={replaceLetter}
          onSent={replaceLetter}
        />
      )}

      {confirmingLetter && (
        <ConfirmDeliveryDialog
          letterId={confirmingLetter.id}
          senderNickname={otherNickname}
          onClose={() => setConfirmingLetter(null)}
          onConfirmed={replaceLetter}
        />
      )}
    </>
  )
}

export default PenPalLetterAction
