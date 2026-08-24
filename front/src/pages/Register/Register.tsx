import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/env.ts'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const canSubmit =
    nickname.trim() !== '' && email.trim() !== '' && password.trim().length >= 8 && acceptedRules

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    // Registration has no backend yet — move straight to the next
    // onboarding step, matching the "01 Register -> 02 Questionnaire" flow.
    navigate('/questionnaire')
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
                  className="input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="DD / MM / YYYY"
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

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
              Create account →
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

            <div className="register-signin">Already a member? Sign in</div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
