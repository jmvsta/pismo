import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import { prepareImageForUpload } from '../../lib/prepareImage.ts'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher.tsx'
import './Register.css'

const AVATAR_MAX_SIDE = 1024

function Register() {
  const navigate = useNavigate()
  const register = useUserStore((state) => state.register)
  const updateAvatar = useUserStore((state) => state.updateAvatar)
  const language = useLanguageStore((state) => state.language)
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
        const { mimeType, imageBase64 } = await prepareImageForUpload(avatarFile, { maxSide: AVATAR_MAX_SIDE })
        await updateAvatar(mimeType, imageBase64).catch(() => undefined)
      }
      navigate('/register/verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : uiText('registerFailed', language))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleOAuth = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <div className="register-page">
      <LanguageSwitcher className="register-page-lang" />
      <div className="register-card">
        <aside className="register-side">
          <div className="register-logo">
            PISMO
            <br />
            NA DAR
          </div>
          <p className="register-pitch">{uiText('authPitch', language)}</p>
          <ol className="register-steps">
            <li className="is-current">{uiText('registerStep01', language)}</li>
            <li>{uiText('registerStep02', language)}</li>
            <li>{uiText('registerStep03', language)}</li>
            <li>{uiText('registerStep04', language)}</li>
            <li>{uiText('registerStep05', language)}</li>
            <li>{uiText('registerStep06', language)}</li>
          </ol>
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>{uiText('registerStepLabel', language)}</h6>
          <h2>{uiText('registerCreateAccount', language)}</h2>

          <div className="register-row">
            <button
              type="button"
              className="avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              aria-label={uiText('registerUploadAvatar', language)}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
              ) : (
                <>
                  <span className="avatar-plus">+</span>
                  <span className="avatar-label">{uiText('registerAvatarUpload', language)}</span>
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
                <label htmlFor="nickname">{uiText('registerNickname', language)}</label>
                <input
                  id="nickname"
                  className="input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="marta.writes"
                />
              </div>
              <div className="field">
                <label htmlFor="dob">{uiText('registerDateOfBirth', language)}</label>
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
              <label htmlFor="email">{uiText('registerEmail', language)}</label>
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
              <label htmlFor="password">{uiText('registerPassword', language)}</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
              <div className="field-hint">{uiText('registerPasswordHint', language)}</div>
            </div>

            <label className="radio rules-check">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
              />
              <span className="dot" />
              <span>{uiText('registerAcceptRules', language)}</span>
            </label>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? uiText('registerCreatingAccount', language) : uiText('registerCreateAccountSubmit', language)}
            </button>

            <div className="register-divider">
              <span />
              {uiText('authOr', language)}
              <span />
            </div>

            <div className="register-oauth">
              <button type="button" className="btn btn-secondary" onClick={handleGoogleOAuth}>
                {uiText('authContinueWithGoogle', language)}
              </button>
            </div>

            <div className="register-signin">
              {uiText('registerAlreadyMember', language)} <Link to="/login">{uiText('registerSignIn', language)}</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
