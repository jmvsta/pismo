import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalConnection } from '../../services/matching/index.ts'
import { addressService } from '../../services/address/index.ts'
import type { UserAddress } from '../../services/address/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import SendLetterDialog from './SendLetterDialog.tsx'
import { formatAddress } from './formatAddress.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText, uiTextWithName } from '../../i18n/uiText.ts'

interface ConnectionRow {
  connection: PenPalConnection
  otherAddress: UserAddress | null
}

function formatEstablished(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

interface ProfilePenPalsProps {
  onGoToAddressTab: () => void
  onLetterChanged?: () => void
}

function ProfilePenPals({ onGoToAddressTab, onLetterChanged }: ProfilePenPalsProps) {
  const currentUserId = useUserStore((state) => state.currentUser?.id)
  const language = useLanguageStore((state) => state.language)
  const [rows, setRows] = useState<ConnectionRow[]>([])
  const [hasOwnAddress, setHasOwnAddress] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [letterDialogFor, setLetterDialogFor] = useState<ConnectionRow | null>(null)

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
        const loadedRows = await Promise.all(
          active.map(async (connection) => ({
            connection,
            otherAddress: await addressService.penPalAddress(connection.id),
          })),
        )
        if (cancelled) return
        setRows(loadedRows)
        setHasOwnAddress(addresses.length > 0)
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

        return (
          <div
            key={row.connection.id}
            className="p-3 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)]"
          >
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
              {!hasOwnAddress && (
                <span className="text-muted text-sm">
                  <button type="button" className="btn btn-ghost" onClick={onGoToAddressTab}>
                    {uiText('letterAddAddress', language)}
                  </button>{' '}
                  {uiText('letterAddAddressSuffix', language)}
                </span>
              )}

              {row.otherAddress ? (
                <>
                  <div className="text-sm">
                    <span className="font-semibold">
                      {other.nickname}
                      {uiText('letterAddressLabel', language)}{' '}
                    </span>
                    {formatAddress(row.otherAddress)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary min-w-[13rem] self-start"
                    onClick={() => setLetterDialogFor(row)}
                  >
                    {uiText('letterSendNew', language)}
                  </button>
                </>
              ) : (
                <span className="text-muted text-sm">{uiTextWithName('letterWaitingForAddress', language, other.nickname)}</span>
              )}
            </div>
          </div>
        )
      })}

      {letterDialogFor && letterDialogFor.otherAddress && (
        <SendLetterDialog
          connectionId={letterDialogFor.connection.id}
          recipientId={
            letterDialogFor.connection.userA.id === currentUserId
              ? letterDialogFor.connection.userB.id
              : letterDialogFor.connection.userA.id
          }
          recipientNickname={
            letterDialogFor.connection.userA.id === currentUserId
              ? letterDialogFor.connection.userB.nickname
              : letterDialogFor.connection.userA.nickname
          }
          recipientAddress={letterDialogFor.otherAddress}
          onClose={() => setLetterDialogFor(null)}
          onSent={() => onLetterChanged?.()}
        />
      )}
    </div>
  )
}

export default ProfilePenPals
