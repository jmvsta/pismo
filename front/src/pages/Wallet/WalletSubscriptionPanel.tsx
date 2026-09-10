import { useState } from 'react'
import { walletService } from '../../services/wallet/index.ts'
import type { PlanSubscription, SubscriptionPlan } from '../../services/wallet/index.ts'
import { formatMinorAmount } from '../../lib/money.ts'

interface WalletSubscriptionPanelProps {
  plans: SubscriptionPlan[]
  subscription: PlanSubscription | null
  onSubscribed: (subscription: PlanSubscription) => void
  onCancelled: (subscription: PlanSubscription) => void
}

function planTariffSummary(plan: SubscriptionPlan): string {
  const parts = [`${plan.lettersSendPerMonth} sent/mo`, `${plan.lettersReceivePerMonth} received/mo`]
  if (plan.addressAllowance > 0) parts.push(`${plan.addressAllowance} addresses/mo`)
  if (plan.maxMembers > 1) parts.push(`up to ${plan.maxMembers} members`)
  return parts.join(' · ')
}

function WalletSubscriptionPanel({ plans, subscription, onSubscribed, onCancelled }: WalletSubscriptionPanelProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await walletService.subscribeToPlan(planId)
      onSubscribed(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe.')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async () => {
    if (!subscription) return
    setBusy(true)
    setError(null)
    try {
      const result = await walletService.cancelSubscription(subscription.id)
      onCancelled(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel the subscription.')
    } finally {
      setBusy(false)
    }
  }

  const handleToggleAutoRenew = async () => {
    if (!subscription) return
    setBusy(true)
    setError(null)
    try {
      const result = await walletService.setAutoRenew(subscription.id, !subscription.autoRenew)
      onSubscribed(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update autopay.')
    } finally {
      setBusy(false)
    }
  }

  if (subscription && subscription.status === 'ACTIVE') {
    return (
      <div className="wallet-subscription">
        <div className="wallet-subscription-plan">{subscription.plan.name}</div>
        <div className="text-muted">{planTariffSummary(subscription.plan)}</div>
        <div className="text-muted">
          Renews{' '}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
        {error && <p className="text-muted">{error}</p>}
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleToggleAutoRenew} disabled={busy}>
            {busy ? 'Working…' : subscription.autoRenew ? 'Autopay: On' : 'Autopay: Off'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={busy}>
            {busy ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-subscription">
      {plans.length === 0 && <p className="text-muted">No subscription plans available.</p>}
      {plans.map((plan) => (
        <div className="wallet-plan-row" key={plan.id}>
          <div>
            <div className="wallet-plan-name">{plan.name}</div>
            <div className="text-muted">
              {formatMinorAmount(plan.priceMinor, plan.currency)} / {plan.billingPeriod.toLowerCase()}
            </div>
            <div className="text-muted">{planTariffSummary(plan)}</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => handleSubscribe(plan.id)} disabled={busy}>
            {busy ? 'Working…' : 'Subscribe →'}
          </button>
        </div>
      ))}
      {error && <p className="text-muted">{error}</p>}
    </div>
  )
}

export default WalletSubscriptionPanel
