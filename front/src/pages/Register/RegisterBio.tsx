import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import './Register.css'

function RegisterBio() {
  const navigate = useNavigate()
  const updateProfile = useUserStore((state) => state.updateProfile)
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goNext = () => navigate('/register/address')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      if (bio.trim() !== '') {
        await updateProfile({ bio })
      }
      goNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your bio.')
    } finally {
      setIsSubmitting(false)
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
            <li>02 — Verify email</li>
            <li className="is-current">03 — Bio</li>
            <li>04 — Address</li>
            <li>05 — Fill the questionnaire</li>
            <li>06 — Get matched. Write.</li>
          </ol>
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>Step 03</h6>
          <h2>Tell your future pen pal about yourself</h2>

          <div className="register-stack">
            <div className="field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                className="input"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Where you're from, what you love, what you'd write about…"
              />
              <div className="field-hint">You can always edit this later from your profile.</div>
            </div>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Continue →'}
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

export default RegisterBio
