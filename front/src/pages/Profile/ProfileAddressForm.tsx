import { useEffect, useState, type FormEvent } from 'react'
import { addressService } from '../../services/address/index.ts'
import type { UserAddress } from '../../services/address/index.ts'

function ProfileAddressForm() {
  const [existing, setExisting] = useState<UserAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [recipientName, setRecipientName] = useState('')
  const [streetLine1, setStreetLine1] = useState('')
  const [streetLine2, setStreetLine2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [countryCode, setCountryCode] = useState('')

  useEffect(() => {
    let cancelled = false
    addressService
      .myAddresses()
      .then((addresses) => {
        if (cancelled) return
        const primary = addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null
        if (primary) {
          setExisting(primary)
          setRecipientName(primary.recipientName)
          setStreetLine1(primary.streetLine1)
          setStreetLine2(primary.streetLine2 ?? '')
          setCity(primary.city)
          setRegion(primary.region ?? '')
          setPostalCode(primary.postalCode ?? '')
          setCountryCode(primary.countryCode)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your address.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const canSubmit = recipientName.trim() !== '' && streetLine1.trim() !== '' && city.trim() !== '' && countryCode.trim() !== ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || saving) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const input = {
        recipientName,
        streetLine1,
        streetLine2: streetLine2 || undefined,
        city,
        region: region || undefined,
        postalCode: postalCode || undefined,
        countryCode,
        isPrimary: true,
      }
      const result = existing ? await addressService.updateAddress(existing.id, input) : await addressService.createAddress(input)
      setExisting(result)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your address.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted profile-empty">Loading your address…</p>

  return (
    <form className="flex max-w-md flex-col gap-3" onSubmit={handleSubmit}>
      <p className="text-muted text-sm">
        Confidential — never shown to other users directly. Only shared with a pen pal once you choose to, after
        you're matched.
      </p>

      <div className="field">
        <label htmlFor="address-recipient">Recipient name</label>
        <input
          id="address-recipient"
          className="input"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="address-line1">Street address</label>
        <input
          id="address-line1"
          className="input"
          value={streetLine1}
          onChange={(e) => setStreetLine1(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="address-line2">Apartment, suite, etc. (optional)</label>
        <input
          id="address-line2"
          className="input"
          value={streetLine2}
          onChange={(e) => setStreetLine2(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <div className="field flex-1">
          <label htmlFor="address-city">City</label>
          <input id="address-city" className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field flex-1">
          <label htmlFor="address-region">Region / state (optional)</label>
          <input
            id="address-region"
            className="input"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="field flex-1">
          <label htmlFor="address-postal">Postal code (optional)</label>
          <input
            id="address-postal"
            className="input"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
        <div className="field flex-1">
          <label htmlFor="address-country">Country code</label>
          <input
            id="address-country"
            className="input"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="US"
            maxLength={2}
          />
        </div>
      </div>

      {error && <p className="text-muted profile-empty">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={!canSubmit || saving}>
        {saving ? 'Saving…' : existing ? 'Save changes' : 'Save address'}
      </button>
      {saved && !saving && <span className="text-muted text-sm">Saved</span>}
    </form>
  )
}

export default ProfileAddressForm
