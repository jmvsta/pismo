import { useEffect, useState } from 'react'
import type { PenPalConnection } from '../../services/matching/index.ts'
import { addressService } from '../../services/address/index.ts'
import type { UserAddress } from '../../services/address/index.ts'
import SendLetterDialog from '../../pages/Profile/SendLetterDialog.tsx'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText, uiTextWithName } from '../../i18n/uiText.ts'

interface PenPalLetterActionProps {
  connection: PenPalConnection
  otherId: string
  otherNickname: string
}

function PenPalLetterAction({ connection, otherId, otherNickname }: PenPalLetterActionProps) {
  const language = useLanguageStore((state) => state.language)
  const [otherAddress, setOtherAddress] = useState<UserAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    addressService
      .penPalAddress(connection.id)
      .then((address) => {
        if (!cancelled) setOtherAddress(address)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the address.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [connection.id])

  if (loading) return null
  if (error) return <span className="text-muted match-card-error">{error}</span>
  if (!otherAddress) {
    return (
      <span className="text-muted match-card-waiting">
        {uiTextWithName('letterWaitingForAddress', language, otherNickname)}
      </span>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-primary min-w-[13rem]" onClick={() => setDialogOpen(true)}>
        {uiText('letterSendNew', language)}
      </button>
      {dialogOpen && (
        <SendLetterDialog
          connectionId={connection.id}
          recipientId={otherId}
          recipientNickname={otherNickname}
          recipientAddress={otherAddress}
          onClose={() => setDialogOpen(false)}
          onSent={() => undefined}
        />
      )}
    </>
  )
}

export default PenPalLetterAction
