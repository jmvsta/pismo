import { useState, type FormEvent } from 'react'
import { useUserStore } from '../../store/userStore.ts'

function ProfileVerifyEmailBanner() {
  const confirmEmail = useUserStore((state) => state.confirmEmail)
  const resendVerificationCode = useUserStore((state) => state.resendVerificationCode)
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (code.trim() === '' || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await confirmEmail(code.trim())
      // A full reload, not just clearing local state -- every tab on this page (and
      // elsewhere in the app) fetched its data once on mount and cached whatever error
      // it got back then, so nothing here re-fetches on its own once verification succeeds.
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm this code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (isResending) return
    setIsResending(true)
    setError(null)
    setResent(false)
    try {
      await resendVerificationCode()
      setResent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border border-[var(--color-accent)] p-4">
      <p className="m-0 font-semibold">Verify your email to unlock matches, letters, and the wallet</p>
      <p className="text-muted m-0 text-sm">Enter the 6-digit code we sent you, or send a new one.</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input w-32"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
        />
        <button type="submit" className="btn btn-primary" disabled={code.trim() === '' || isSubmitting}>
          {isSubmitting ? 'Confirming…' : 'Confirm'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleResend} disabled={isResending}>
          {isResending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
      {error && <p className="text-muted m-0 text-sm">{error}</p>}
      {resent && !error && <p className="text-muted m-0 text-sm">A new code was sent.</p>}
    </form>
  )
}

export default ProfileVerifyEmailBanner
