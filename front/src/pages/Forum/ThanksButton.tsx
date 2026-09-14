import { useState, type MouseEvent } from 'react'

interface ThanksButtonProps {
  count: number
  pressed: boolean
  onThank: () => Promise<void>
}

function ThanksButton({ count, pressed, onThank }: ThanksButtonProps) {
  const [busy, setBusy] = useState(false)

  const handleClick = async (e: MouseEvent) => {
    e.stopPropagation()
    if (busy || pressed) return
    setBusy(true)
    try {
      await onThank()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`forum-thanks-btn${pressed ? ' is-pressed' : ''}`}
      onClick={handleClick}
      disabled={busy || pressed}
      aria-pressed={pressed}
      aria-label={pressed ? 'Thanked' : 'Say thanks'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill={pressed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-10-9.2C.5 7.9 2.3 4.5 5.7 4c2-.3 3.9.6 6.3 3 2.4-2.4 4.3-3.3 6.3-3 3.4.5 5.2 3.9 3.7 7.3-2.5 4.6-10 9.2-10 9.2z" />
      </svg>
      {count}
    </button>
  )
}

export default ThanksButton
