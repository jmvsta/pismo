import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlWalletService } from './GraphqlWalletService.ts'

export type { WalletService } from './WalletService.ts'
export type {
  Wallet,
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  SubscriptionPlan,
  BillingPeriod,
  PlanSubscription,
  SubscriptionStatus,
  SubscriptionMember,
  SubscriptionMemberRole,
  UserMonthlyAllowance,
} from './types.ts'

export const walletService = new GraphqlWalletService(graphqlClient)
