import { useEffect, useState } from 'react'
import { useWalletStore } from '../../store/walletStore.ts'
import { walletService } from '../../services/wallet/index.ts'
import type { PlanSubscription, SubscriptionPlan } from '../../services/wallet/index.ts'
import { formatMinorAmount } from '../../lib/money.ts'
import WalletTopUpForm from './WalletTopUpForm.tsx'
import WalletBillingList from './WalletBillingList.tsx'
import WalletSubscriptionPanel from './WalletSubscriptionPanel.tsx'
import WalletPaymentMethods from './WalletPaymentMethods.tsx'
import './Wallet.css'

function Wallet() {
  const { wallet, status, error, loadWallet, addTransaction } = useWalletStore()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [subscription, setSubscription] = useState<PlanSubscription | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)

  useEffect(() => {
    loadWallet()
  }, [loadWallet])

  useEffect(() => {
    let cancelled = false
    Promise.all([walletService.subscriptionPlans(), walletService.mySubscription()])
      .then(([fetchedPlans, mySubscription]) => {
        if (cancelled) return
        setPlans(fetchedPlans)
        setSubscription(mySubscription)
      })
      .catch((err) => {
        if (!cancelled) {
          setSubscriptionError(err instanceof Error ? err.message : 'Could not load subscription info.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="wallet-page">
        <p className="text-muted">Loading wallet…</p>
      </div>
    )
  }

  if (status === 'error' || !wallet) {
    return (
      <div className="wallet-page">
        <p className="text-muted">{error ?? 'Could not load your wallet.'}</p>
      </div>
    )
  }

  return (
    <div className="wallet-page">
      <div className="wallet-card">
        <div className="wallet-balance">
          <div className="wallet-balance-label">Balance</div>
          <div className="wallet-balance-value">{formatMinorAmount(wallet.balanceMinor, wallet.currency)}</div>
        </div>

        <WalletTopUpForm currency={wallet.currency} onTopUp={addTransaction} />

        <div>
          <h6>Billing history</h6>
          <WalletBillingList transactions={wallet.transactions} />
        </div>

        <div>
          <h6>Payment methods</h6>
          <WalletPaymentMethods />
        </div>

        <div>
          <h6>Subscription</h6>
          {subscriptionError && <p className="text-muted">{subscriptionError}</p>}
          <WalletSubscriptionPanel
            plans={plans}
            subscription={subscription}
            onSubscribed={setSubscription}
            onCancelled={setSubscription}
          />
        </div>
      </div>
    </div>
  )
}

export default Wallet
