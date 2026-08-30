import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/env.ts'
import { useUserStore } from '../../store/userStore.ts'
import './Register.css'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function Register() {
  const navigate = useNavigate()
  const register = useUserStore((state) => state.register)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit =
    nickname.trim() !== '' && email.trim() !== '' && password.trim().length >= 8 && acceptedRules

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await register({
        nickname,
        email,
        password,
        dateOfBirth: dob || undefined,
        acceptedRules,
      })
      if (avatarFile) {
        const avatarUrl = await readFileAsDataUrl(avatarFile)
        await updateProfile({ avatarUrl })
      }
      navigate('/questionnaire')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleOAuth = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`
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
            <li className="is-current">01 — Register</li>
            <li>02 — Fill the questionnaire</li>
            <li>03 — Get matched. Write.</li>
          </ol>
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>Step 01</h6>
          <h2>Create account</h2>

          <div className="register-row">
            <button
              type="button"
              className="avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload avatar"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
              ) : (
                <>
                  <span className="avatar-plus">+</span>
                  <span className="avatar-label">
                    avatar
                    <br />
                    upload
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />

            <div className="register-fields">
              <div className="field">
                <label htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  className="input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="marta.writes"
                />
              </div>
              <div className="field">
                <label htmlFor="dob">Date of birth</label>
                <input
                  id="dob"
                  type="date"
                  className="input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="register-stack">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marta@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
              <div className="field-hint">Min. 8 characters, at least one number</div>
            </div>

            <label className="radio rules-check">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
              />
              <span className="dot" />
              <span>I accept the community rules and privacy policy</span>
            </label>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account →'}
            </button>

            <div className="register-divider">
              <span />
              or
              <span />
            </div>

            <div className="register-oauth">
              <button type="button" className="btn btn-secondary" onClick={handleGoogleOAuth}>
                Continue with Google
              </button>
              <button type="button" className="btn btn-secondary">
                Continue with Apple
              </button>
            </div>

            <div className="register-signin">
              Already a member? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
