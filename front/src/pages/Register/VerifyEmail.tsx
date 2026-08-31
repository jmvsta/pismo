import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import './Register.css'

function VerifyEmail() {
  const navigate = useNavigate()
  const confirmEmail = useUserStore((state) => state.confirmEmail)
  const resendVerificationCode = useUserStore((state) => state.resendVerificationCode)
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goNext = () => navigate('/register/bio')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (code.trim() === '' || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await confirmEmail(code.trim())
      goNext()
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
    <div className="register-page">
      <div className="register-card">
        <aside className="register-side">
          <div className="register-logo">
            PISMO
            <br />
            NA DAR
          </div>
          <p className="register-pitch">
            Handwritten letters, sent by real post, between people matched by what they actually
            care about. A deliberate anti-social-network.
          </p>
          <ol className="register-steps">
            <li>01 — Register</li>
            <li className="is-current">02 — Verify email</li>
            <li>03 — Bio</li>
            <li>04 — Address</li>
            <li>05 — Fill the questionnaire</li>
            <li>06 — Get matched. Write.</li>
          </ol>
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>Step 02</h6>
          <h2>Check your email</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            We sent a 6-digit code to your email address. Enter it below to confirm it's really you.
          </p>

          <div className="register-stack">
            <div className="field">
              <label htmlFor="verify-code">Code</label>
              <input
                id="verify-code"
                className="input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && <div className="field-hint">{error}</div>}
            {resent && !error && <div className="field-hint">A new code was sent.</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={code.trim() === '' || isSubmitting}>
              {isSubmitting ? 'Confirming…' : 'Confirm →'}
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={handleResend} disabled={isResending}>
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={goNext}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyEmail
