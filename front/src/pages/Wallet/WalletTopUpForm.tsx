import { useState, type FormEvent } from 'react'
import { walletService } from '../../services/wallet/index.ts'
import type { WalletTransaction } from '../../services/wallet/index.ts'

interface WalletTopUpFormProps {
  currency: string
  onTopUp: (transaction: WalletTransaction) => void
}

function WalletTopUpForm({ currency, onTopUp }: WalletTopUpFormProps) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedAmount = Number(amount)
  const canSubmit = amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0 && !submitting

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const amountMinor = Math.round(parsedAmount * 100)
      const transaction = await walletService.initiateWalletTopUp(amountMinor, currency)
      onTopUp(transaction)
      setAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the top-up.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="wallet-topup" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="wallet-topup-amount">Top up amount ({currency})</label>
        <input
          id="wallet-topup-amount"
          className="input"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10.00"
        />
      </div>
      {error && <p className="text-muted">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {submitting ? 'Starting…' : 'Top up →'}
      </button>
    </form>
  )
}

export default WalletTopUpForm
