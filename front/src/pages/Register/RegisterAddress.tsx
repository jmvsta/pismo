import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addressService } from '../../services/address/index.ts'
import './Register.css'

function RegisterAddress() {
  const navigate = useNavigate()
  const [recipientName, setRecipientName] = useState('')
  const [streetLine1, setStreetLine1] = useState('')
  const [streetLine2, setStreetLine2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goNext = () => navigate('/questionnaire')

  const canSubmit = recipientName.trim() !== '' && streetLine1.trim() !== '' && city.trim() !== '' && countryCode.trim() !== ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await addressService.createAddress({
        recipientName,
        streetLine1,
        streetLine2: streetLine2 || undefined,
        city,
        region: region || undefined,
        postalCode: postalCode || undefined,
        countryCode,
        isPrimary: true,
      })
      goNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your address.')
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
            <li>03 — Bio</li>
            <li className="is-current">04 — Address</li>
            <li>05 — Fill the questionnaire</li>
            <li>06 — Get matched. Write.</li>
          </ol>
        </aside>

        <form className="register-form" onSubmit={handleSubmit}>
          <h6>Step 04</h6>
          <h2>Where should letters find you?</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            Confidential — never shown to other users. Only shared with a pen pal once you're matched and choose to.
          </p>

          <div className="register-stack">
            <div className="field">
              <label htmlFor="reg-address-recipient">Recipient name</label>
              <input
                id="reg-address-recipient"
                className="input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-address-line1">Street address</label>
              <input
                id="reg-address-line1"
                className="input"
                value={streetLine1}
                onChange={(e) => setStreetLine1(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-address-line2">Apartment, suite, etc. (optional)</label>
              <input
                id="reg-address-line2"
                className="input"
                value={streetLine2}
                onChange={(e) => setStreetLine2(e.target.value)}
              />
            </div>
            <div className="register-row">
              <div className="field">
                <label htmlFor="reg-address-city">City</label>
                <input
                  id="reg-address-city"
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="reg-address-region">Region / state (optional)</label>
                <input
                  id="reg-address-region"
                  className="input"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>
            <div className="register-row">
              <div className="field">
                <label htmlFor="reg-address-postal">Postal code (optional)</label>
                <input
                  id="reg-address-postal"
                  className="input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="reg-address-country">Country code</label>
                <input
                  id="reg-address-country"
                  className="input"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  placeholder="US"
                  maxLength={2}
                />
              </div>
            </div>

            {error && <div className="field-hint">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || isSubmitting}>
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

export default RegisterAddress
