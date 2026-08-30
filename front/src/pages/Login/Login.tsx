import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import '../Register/Register.css'

function Login() {
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)

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
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleOAuth = () => {
    window.location.href = '/oauth2/authorization/google'
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
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>Welcome back</h6>
          <h2>Sign in</h2>

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
            </div>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in →'}
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
            </div>

            <div className="register-signin">
              New here? <Link to="/register">Create an account</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
