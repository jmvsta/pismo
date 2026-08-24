import type { WalletTransaction } from '../../services/wallet/index.ts'
import { formatMinorAmount } from '../../lib/money.ts'

interface WalletBillingListProps {
  transactions: WalletTransaction[]
}

function formatEnumLabel(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function WalletBillingList({ transactions }: WalletBillingListProps) {
  if (transactions.length === 0) {
    return <p className="text-muted wallet-empty">No transactions yet.</p>
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>{formatEnumLabel(transaction.type)}</td>
            <td className={transaction.amountMinor >= 0 ? 'wallet-amount-credit' : 'wallet-amount-debit'}>
              {transaction.amountMinor >= 0 ? '+' : ''}
              {formatMinorAmount(transaction.amountMinor, transaction.currency)}
            </td>
            <td>
              <span className={transaction.status === 'COMPLETED' ? 'tag tag-accent' : 'tag tag-neutral'}>
                {formatEnumLabel(transaction.status)}
              </span>
            </td>
            <td className="text-muted">{formatDate(transaction.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default WalletBillingList
