import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalConnection } from '../../services/matching/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import type { Letter } from '../../services/letters/index.ts'
import { addressService } from '../../services/address/index.ts'
import type { ConnectionAddressConsent, UserAddress } from '../../services/address/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import SendLetterDialog from './SendLetterDialog.tsx'
import ConfirmDeliveryDialog from './ConfirmDeliveryDialog.tsx'

const OPEN_STATUSES = new Set(['DRAFT', 'SENT', 'IN_TRANSIT'])

interface ConnectionRow {
  connection: PenPalConnection
  letters: Letter[]
  myConsent: ConnectionAddressConsent | null
  otherConsent: ConnectionAddressConsent | null
}

function otherUserId(connection: PenPalConnection, userId: string): string {
  return connection.userA.id === userId ? connection.userB.id : connection.userA.id
}

function formatEstablished(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatAddress(address: UserAddress): string {
  return [address.recipientName, address.streetLine1, address.streetLine2, address.city, address.region, address.postalCode, address.countryCode]
    .filter(Boolean)
    .join(', ')
}

async function loadRow(connection: PenPalConnection, currentUserId: string): Promise<ConnectionRow> {
  const [letters, consents] = await Promise.all([
    lettersService.lettersForConnection(connection.id),
    addressService.addressConsentsForConnection(connection.id),
  ])
  const myConsent = consents.find((consent) => consent.grantor.id === currentUserId) ?? null
  const otherConsent = consents.find((consent) => consent.grantor.id !== currentUserId) ?? null
  return { connection, letters, myConsent, otherConsent }
}

interface ProfilePenPalsProps {
  onGoToAddressTab: () => void
}

function ProfilePenPals({ onGoToAddressTab }: ProfilePenPalsProps) {
  const currentUserId = useUserStore((state) => state.currentUser?.id)
  const [rows, setRows] = useState<ConnectionRow[]>([])
  const [myAddress, setMyAddress] = useState<UserAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [letterDialogFor, setLetterDialogFor] = useState<{ connection: PenPalConnection; existing: Letter | null } | null>(null)
  const [confirmDialogFor, setConfirmDialogFor] = useState<{ connectionId: string; letter: Letter } | null>(null)

  useEffect(() => {
    if (!currentUserId) return
    let cancelled = false

    async function load() {
      try {
        const [connections, addresses] = await Promise.all([
          matchingService.myConnections(),
          addressService.myAddresses(),
        ])
        const active = connections.filter((connection) => !connection.endedAt)
        const loadedRows = await Promise.all(active.map((connection) => loadRow(connection, currentUserId!)))
        if (cancelled) return
        setRows(loadedRows)
        setMyAddress(addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your pen pals.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [currentUserId])

  const updateRow = (connectionId: string, patch: Partial<ConnectionRow>) => {
    setRows((prev) => prev.map((row) => (row.connection.id === connectionId ? { ...row, ...patch } : row)))
  }

  const replaceLetter = (connectionId: string, letter: Letter) => {
    setRows((prev) =>
      prev.map((row) =>
        row.connection.id === connectionId
          ? { ...row, letters: [letter, ...row.letters.filter((existing) => existing.id !== letter.id)] }
          : row,
      ),
    )
  }

  const handleToggleShare = async (row: ConnectionRow) => {
    if (!myAddress) return
    try {
      if (row.myConsent?.status === 'GRANTED') {
        const consent = await addressService.revokeAddressConsent(row.connection.id)
        updateRow(row.connection.id, { myConsent: consent })
      } else {
        const consent = await addressService.grantAddressConsent(row.connection.id, myAddress.id)
        updateRow(row.connection.id, { myConsent: consent })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update address sharing.')
    }
  }

  if (loading) return <p className="text-muted profile-empty">Loading your pen pals…</p>
  if (error) return <p className="text-muted profile-empty">{error}</p>
  if (rows.length === 0) {
    return (
      <p className="text-muted profile-empty">
        No pen pals yet — <Link to="/matches">find someone to write to</Link>.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        const other = row.connection.userA.id === currentUserId ? row.connection.userB : row.connection.userA
        const avatarUrl = imageUrl(other.avatarImageId)
        const requesterId = row.connection.request?.requester.id
        const hasEverSentFirstLetter = row.letters.some(
          (letter) => letter.sender.id === requesterId && letter.status !== 'DRAFT',
        )
        const otherAddressVisible =
          hasEverSentFirstLetter && row.otherConsent?.status === 'GRANTED' && Boolean(row.otherConsent.address)

        const openLetter = row.letters.find((letter) => OPEN_STATUSES.has(letter.status)) ?? null
        const deliveredLetters = row.letters.filter((letter) => letter.status === 'DELIVERED')
        const lastDelivered = deliveredLetters[0] ?? null
        const eligibleSenderId = lastDelivered
          ? otherUserId(row.connection, lastDelivered.sender.id)
          : (requesterId ?? currentUserId)
        const isMyTurnToSend = !openLetter && eligibleSenderId === currentUserId

        return (
          <div key={row.connection.id} className="border border-[var(--color-divider)] p-3">
            <div className="flex items-center gap-3">
              <div className={`profile-avatar${avatarUrl ? '' : ' photo-placeholder'}`} style={{ width: 48, height: 48 }}>
                {avatarUrl ? <img src={avatarUrl} alt={other.nickname} /> : <span>avatar</span>}
              </div>
              <div className="flex flex-col">
                <Link to={`/profile/${other.id}`} className="font-semibold">
                  {other.nickname}
                </Link>
                <span className="text-muted text-sm">Pen pals since {formatEstablished(row.connection.establishedAt)}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.myConsent?.status === 'GRANTED'}
                  disabled={!myAddress}
                  onChange={() => handleToggleShare(row)}
                />
                Share my address with this pen pal
              </label>
              {!myAddress && (
                <span className="text-muted text-sm">
                  <button type="button" className="btn btn-ghost" onClick={onGoToAddressTab}>
                    Add your address
                  </button>{' '}
                  first.
                </span>
              )}

              {openLetter && openLetter.sender.id === currentUserId && (
                <span className="text-muted text-sm">
                  {openLetter.status === 'DRAFT' ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setLetterDialogFor({ connection: row.connection, existing: openLetter })}
                    >
                      Resume sending your letter
                    </button>
                  ) : (
                    <>
                      Sent — waiting for {other.nickname} to confirm delivery. Your code:{' '}
                      <strong>{openLetter.trackingCode}</strong>
                    </>
                  )}
                </span>
              )}

              {openLetter && openLetter.recipient.id === currentUserId && openLetter.status === 'DRAFT' && (
                <span className="text-muted text-sm">Waiting for {other.nickname} to finish and send their letter.</span>
              )}
              {openLetter && openLetter.recipient.id === currentUserId && openLetter.status !== 'DRAFT' && (
                <button
                  type="button"
                  className="btn btn-primary self-start"
                  onClick={() => setConfirmDialogFor({ connectionId: row.connection.id, letter: openLetter })}
                >
                  Confirm delivery
                </button>
              )}

              {!openLetter && isMyTurnToSend && (
                <button
                  type="button"
                  className="btn btn-primary self-start"
                  onClick={() => setLetterDialogFor({ connection: row.connection, existing: null })}
                >
                  {deliveredLetters.length === 0 ? 'Send first letter' : 'Reply'}
                </button>
              )}
              {!openLetter && !isMyTurnToSend && (
                <span className="text-muted text-sm">Waiting for {other.nickname} to write.</span>
              )}

              {otherAddressVisible && row.otherConsent?.address && (
                <div className="text-sm">
                  <span className="font-semibold">{other.nickname}'s address: </span>
                  {formatAddress(row.otherConsent.address)}
                </div>
              )}
              {hasEverSentFirstLetter && !otherAddressVisible && (
                <span className="text-muted text-sm">Waiting for {other.nickname} to share their address.</span>
              )}
            </div>
          </div>
        )
      })}

      {letterDialogFor &&
        (() => {
          const row = rows.find((r) => r.connection.id === letterDialogFor.connection.id)
          const recipientId = otherUserId(letterDialogFor.connection, currentUserId!)
          const recipientNickname =
            letterDialogFor.connection.userA.id === currentUserId
              ? letterDialogFor.connection.userB.nickname
              : letterDialogFor.connection.userA.nickname
          const recipientAddress =
            row?.otherConsent?.status === 'GRANTED' ? row.otherConsent.address : null
          return (
            <SendLetterDialog
              connectionId={letterDialogFor.connection.id}
              recipientId={recipientId}
              recipientNickname={recipientNickname}
              recipientAddress={recipientAddress}
              existingLetter={letterDialogFor.existing}
              onClose={() => setLetterDialogFor(null)}
              onSent={(letter) => replaceLetter(letterDialogFor.connection.id, letter)}
            />
          )
        })()}

      {confirmDialogFor && (
        <ConfirmDeliveryDialog
          letterId={confirmDialogFor.letter.id}
          senderNickname={confirmDialogFor.letter.sender.nickname}
          onClose={() => setConfirmDialogFor(null)}
          onConfirmed={(letter) => replaceLetter(confirmDialogFor.connectionId, letter)}
        />
      )}
    </div>
  )
}

export default ProfilePenPals
