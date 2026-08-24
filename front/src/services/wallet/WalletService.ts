import type {
  PlanSubscription,
  SubscriptionMember,
  SubscriptionPlan,
  UserMonthlyAllowance,
  Wallet,
  WalletTransaction,
} from './types.ts'

export interface WalletService {
  myWallet(): Promise<Wallet | null>
  subscriptionPlans(): Promise<SubscriptionPlan[]>
  mySubscription(): Promise<PlanSubscription | null>
  myMonthlyAllowance(): Promise<UserMonthlyAllowance | null>
  initiateWalletTopUp(amountMinor: number, currency: string): Promise<WalletTransaction>
  subscribeToPlan(planId: string): Promise<PlanSubscription>
  cancelSubscription(id: string): Promise<PlanSubscription>
  addSubscriptionMember(
    subscriptionId: string,
    userId: string,
    isMinor: boolean,
  ): Promise<SubscriptionMember>
  removeSubscriptionMember(subscriptionId: string, userId: string): Promise<SubscriptionMember>
}
