import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { useEffect, useState, type FormEvent } from 'react'
import { walletService } from '../../services/wallet/index.ts'
import type { PaymentMethod } from '../../services/wallet/index.ts'
import { STRIPE_PUBLISHABLE_KEY } from '../../config/env.ts'

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

interface AddCardFormProps {
  onAdded: (method: PaymentMethod) => void
  onCancel: () => void
}

function AddCardForm({ onAdded, onCancel }: AddCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card details are not ready yet.')
      const clientSecret = await walletService.createSetupIntent()
      const result = await stripe.confirmCardSetup(clientSecret, { payment_method: { card: cardElement } })
      if (result.error) throw new Error(result.error.message ?? 'Could not save this card.')
      const paymentMethodId = result.setupIntent.payment_method
      if (typeof paymentMethodId !== 'string') throw new Error('Could not save this card.')
      const saved = await walletService.addCard(paymentMethodId)
      onAdded(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this card.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="input p-3">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      {error && <p className="text-muted">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!stripe || submitting}>
          {submitting ? 'Saving…' : 'Save card'}
        </button>
      </div>
    </form>
  )
}

function formatCard(method: PaymentMethod): string {
  const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card'
  const expiry = method.expMonth && method.expYear ? ` · exp ${method.expMonth}/${method.expYear}` : ''
  return `${brand} •••• ${method.last4 ?? '????'}${expiry}`
}

function WalletPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    walletService
      .myPaymentMethods()
      .then((fetched) => {
        if (!cancelled) setMethods(fetched)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load payment methods.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleAdded = (method: PaymentMethod) => {
    setMethods((prev) => [...prev, method])
    setIsAdding(false)
  }

  const handleRemove = async (id: string) => {
    setBusyId(id)
    setError(null)
    try {
      await walletService.removeCard(id)
      setMethods((prev) => prev.filter((method) => method.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this card.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-muted">{error}</p>}
      {methods.length === 0 && !isAdding && <p className="text-muted">No cards saved yet.</p>}
      {methods.map((method) => (
        <div key={method.id} className="flex items-center justify-between gap-3">
          <span>
            {formatCard(method)}
            {method.isDefault && ' · default'}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => handleRemove(method.id)}
            disabled={busyId === method.id}
          >
            {busyId === method.id ? 'Removing…' : 'Remove'}
          </button>
        </div>
      ))}
      {isAdding ? (
        stripePromise ? (
          <Elements stripe={stripePromise}>
            <AddCardForm onAdded={handleAdded} onCancel={() => setIsAdding(false)} />
          </Elements>
        ) : (
          <p className="text-muted">Card payments aren't configured yet.</p>
        )
      ) : (
        <button type="button" className="btn btn-secondary w-fit" onClick={() => setIsAdding(true)}>
          + Add card
        </button>
      )}
    </div>
  )
}

export default WalletPaymentMethods
