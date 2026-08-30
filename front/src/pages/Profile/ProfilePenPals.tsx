import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalConnection } from '../../services/matching/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import { addressService } from '../../services/address/index.ts'
import type { ConnectionAddressConsent, UserAddress } from '../../services/address/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import SendLetterDialog from './SendLetterDialog.tsx'

interface ConnectionRow {
  connection: PenPalConnection
  isRequester: boolean
  firstLetterSent: boolean
  myConsent: ConnectionAddressConsent | null
  otherConsent: ConnectionAddressConsent | null
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
  const requesterId = connection.request?.requester.id
  const isRequester = requesterId === currentUserId
  const [letters, consents] = await Promise.all([
    lettersService.lettersForConnection(connection.id),
    addressService.addressConsentsForConnection(connection.id),
  ])
  const firstLetterSent = letters.some((letter) => letter.sender.id === requesterId && letter.status !== 'DRAFT')
  const myConsent = consents.find((consent) => consent.grantor.id === currentUserId) ?? null
  const otherConsent = consents.find((consent) => consent.grantor.id !== currentUserId) ?? null
  return { connection, isRequester, firstLetterSent, myConsent, otherConsent }
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
  const [letterDialogFor, setLetterDialogFor] = useState<PenPalConnection | null>(null)

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
        const otherAddressVisible = row.firstLetterSent && row.otherConsent?.status === 'GRANTED' && row.otherConsent.address

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

              {!row.firstLetterSent && row.isRequester && (
                <button type="button" className="btn btn-primary self-start" onClick={() => setLetterDialogFor(row.connection)}>
                  Send first letter
                </button>
              )}
              {!row.firstLetterSent && !row.isRequester && (
                <span className="text-muted text-sm">Waiting for {other.nickname} to write first.</span>
              )}

              {row.firstLetterSent && otherAddressVisible && row.otherConsent?.address && (
                <div className="text-sm">
                  <span className="font-semibold">{other.nickname}'s address: </span>
                  {formatAddress(row.otherConsent.address)}
                </div>
              )}
              {row.firstLetterSent && !otherAddressVisible && (
                <span className="text-muted text-sm">Waiting for {other.nickname} to share their address.</span>
              )}
            </div>
          </div>
        )
      })}

      {letterDialogFor && (
        <SendLetterDialog
          connectionId={letterDialogFor.id}
          recipientId={
            letterDialogFor.userA.id === currentUserId ? letterDialogFor.userB.id : letterDialogFor.userA.id
          }
          recipientNickname={
            letterDialogFor.userA.id === currentUserId ? letterDialogFor.userB.nickname : letterDialogFor.userA.nickname
          }
          onClose={() => setLetterDialogFor(null)}
          onSent={() => updateRow(letterDialogFor.id, { firstLetterSent: true })}
        />
      )}
    </div>
  )
}

export default ProfilePenPals
