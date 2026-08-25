import { useState, type MouseEvent } from 'react'

interface ThanksButtonProps {
  count: number
  onThank: () => Promise<void>
}

function ThanksButton({ count, onThank }: ThanksButtonProps) {
  const [busy, setBusy] = useState(false)

  const handleClick = async (e: MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await onThank()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className="forum-thanks-btn" onClick={handleClick} disabled={busy}>
      {count} thanks
    </button>
  )
}

export default ThanksButton
