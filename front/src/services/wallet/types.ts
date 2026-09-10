import type { LetterSummary } from '../letters/types.ts'
import type { UserSummary } from '../user/types.ts'

export type WalletTransactionType =
  | 'TOP_UP'
  | 'STAMP_PURCHASE'
  | 'SUBSCRIPTION'
  | 'REFUND'
  | 'BONUS'
  | 'ADJUSTMENT'
export type WalletTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type BillingPeriod = 'MONTHLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
export type SubscriptionMemberRole = 'OWNER' | 'MEMBER'

/** amountMinor is signed: credits are positive, debits negative. */
export interface WalletTransaction {
  id: string
  amountMinor: number
  currency: string
  type: WalletTransactionType
  status: WalletTransactionStatus
  letter: LetterSummary | null
  externalRef: string | null
  description: string | null
  createdAt: string
  settledAt: string | null
}

/** balanceMinor is in minor units (cents); "EUR 4.50" is stored/returned as 450. */
export interface Wallet {
  id: string
  user: UserSummary
  balanceMinor: number
  currency: string
  createdAt: string
  updatedAt: string
  transactions: WalletTransaction[]
}

export interface SubscriptionPlan {
  id: string
  code: string
  name: string
  description: string | null
  priceMinor: number
  currency: string
  billingPeriod: BillingPeriod
  active: boolean
  lettersSendPerMonth: number
  lettersReceivePerMonth: number
  addressAllowance: number
  maxMembers: number
}

/**
 * The owner also has a MEMBER-shaped row with role OWNER; isMinor applies the
 * family plan's stricter rules (no address access, no photos).
 */
export interface SubscriptionMember {
  subscriptionId: string
  user: UserSummary
  role: SubscriptionMemberRole
  isMinor: boolean
  addedAt: string
  removedAt: string | null
}

/**
 * Named PlanSubscription (not "Subscription") to avoid colliding with
 * GraphQL's reserved root Subscription operation type.
 */
export interface PlanSubscription {
  id: string
  user: UserSummary
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startedAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  externalRef: string | null
  autoRenew: boolean
  members: SubscriptionMember[]
  createdAt: string
  updatedAt: string
}

/** Only a Stripe PaymentMethod reference and display metadata -- raw card numbers never pass through this API. */
export interface PaymentMethod {
  id: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
  createdAt: string
}

/** Effective monthly limit = plan quota + bonus columns for that period. */
export interface UserMonthlyAllowance {
  user: UserSummary
  period: string
  lettersSent: number
  lettersReceived: number
  addressesUnlocked: number
  bonusSendQuota: number
  bonusReceiveQuota: number
  bonusAddresses: number
  createdAt: string
  updatedAt: string
}
