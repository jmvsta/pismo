import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher.tsx'
import '../Register/Register.css'

function Login() {
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)
  const language = useLanguageStore((state) => state.language)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = email.trim() !== '' && password.trim() !== ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : uiText('loginFailed', language))
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
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>{uiText('loginWelcomeBack', language)}</h6>
          <h2>{uiText('loginSignIn', language)}</h2>

          <div className="register-stack">
            <div className="field">
              <label htmlFor="email">{uiText('loginEmailOrUsername', language)}</label>
              <input
                id="email"
                type="text"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marta@example.com or marta"
              />
            </div>
            <div className="field">
              <label htmlFor="password">{uiText('loginPassword', language)}</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? uiText('loginSigningIn', language) : uiText('loginSignInSubmit', language)}
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
              {uiText('loginNewHere', language)} <Link to="/register">{uiText('loginCreateAccount', language)}</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
