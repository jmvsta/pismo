import type { GraphqlClient } from '../graphqlClient.ts'
import { LETTER_SUMMARY_FIELDS } from '../letters/GraphqlLettersService.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type {
  PlanSubscription,
  SubscriptionMember,
  SubscriptionPlan,
  UserMonthlyAllowance,
  Wallet,
  WalletTransaction,
} from './types.ts'
import type { WalletService } from './WalletService.ts'

const TRANSACTION_FIELDS = `
  id
  amountMinor
  currency
  type
  status
  letter { ${LETTER_SUMMARY_FIELDS} }
  externalRef
  description
  createdAt
  settledAt
`

const WALLET_FIELDS = `
  id
  user { ${USER_SUMMARY_FIELDS} }
  balanceMinor
  currency
  createdAt
  updatedAt
  transactions { ${TRANSACTION_FIELDS} }
`

const PLAN_FIELDS = `
  id
  code
  name
  description
  priceMinor
  currency
  billingPeriod
  active
  lettersSendPerMonth
  lettersReceivePerMonth
  addressAllowance
  maxMembers
`

// Wire member shape omits the "subscription" back-reference (it would cycle
// back into the PlanSubscription that's already the parent of this list);
// subscriptionId is filled in from the parent subscription's id when mapped.
interface SubscriptionMemberWire {
  user: SubscriptionMember['user']
  role: SubscriptionMember['role']
  isMinor: boolean
  addedAt: string
  removedAt: string | null
}

const MEMBER_FIELDS = `
  user { ${USER_SUMMARY_FIELDS} }
  role
  isMinor
  addedAt
  removedAt
`

interface PlanSubscriptionWire {
  id: string
  user: PlanSubscription['user']
  plan: SubscriptionPlan
  status: PlanSubscription['status']
  startedAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  externalRef: string | null
  members: SubscriptionMemberWire[]
  createdAt: string
  updatedAt: string
}

const SUBSCRIPTION_FIELDS = `
  id
  user { ${USER_SUMMARY_FIELDS} }
  plan { ${PLAN_FIELDS} }
  status
  startedAt
  currentPeriodStart
  currentPeriodEnd
  cancelledAt
  externalRef
  members { ${MEMBER_FIELDS} }
  createdAt
  updatedAt
`

// The two member mutations return a SubscriptionMember with no PlanSubscription
// parent already in hand, so this shape selects the subscription id directly.
interface StandaloneSubscriptionMemberWire extends SubscriptionMemberWire {
  subscription: { id: string }
}

const STANDALONE_MEMBER_FIELDS = `
  subscription { id }
  ${MEMBER_FIELDS}
`

const ALLOWANCE_FIELDS = `
  user { ${USER_SUMMARY_FIELDS} }
  period
  lettersSent
  lettersReceived
  addressesUnlocked
  bonusSendQuota
  bonusReceiveQuota
  bonusAddresses
  createdAt
  updatedAt
`

function toPlanSubscription(wire: PlanSubscriptionWire): PlanSubscription {
  return {
    ...wire,
    members: wire.members.map((member) => ({ ...member, subscriptionId: wire.id })),
  }
}

function toSubscriptionMember(wire: StandaloneSubscriptionMemberWire): SubscriptionMember {
  const { subscription, ...member } = wire
  return { ...member, subscriptionId: subscription.id }
}

const MY_WALLET_QUERY = `
  query MyWallet {
    myWallet {
      ${WALLET_FIELDS}
    }
  }
`

const SUBSCRIPTION_PLANS_QUERY = `
  query SubscriptionPlans {
    subscriptionPlans {
      ${PLAN_FIELDS}
    }
  }
`

const MY_SUBSCRIPTION_QUERY = `
  query MySubscription {
    mySubscription {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`

const MY_MONTHLY_ALLOWANCE_QUERY = `
  query MyMonthlyAllowance {
    myMonthlyAllowance {
      ${ALLOWANCE_FIELDS}
    }
  }
`

const INITIATE_WALLET_TOP_UP_MUTATION = `
  mutation InitiateWalletTopUp($amountMinor: Int!, $currency: String!) {
    initiateWalletTopUp(amountMinor: $amountMinor, currency: $currency) {
      ${TRANSACTION_FIELDS}
    }
  }
`

const SUBSCRIBE_TO_PLAN_MUTATION = `
  mutation SubscribeToPlan($planId: ID!) {
    subscribeToPlan(planId: $planId) {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`

const CANCEL_SUBSCRIPTION_MUTATION = `
  mutation CancelSubscription($id: ID!) {
    cancelSubscription(id: $id) {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`

const ADD_SUBSCRIPTION_MEMBER_MUTATION = `
  mutation AddSubscriptionMember($subscriptionId: ID!, $userId: ID!, $isMinor: Boolean!) {
    addSubscriptionMember(subscriptionId: $subscriptionId, userId: $userId, isMinor: $isMinor) {
      ${STANDALONE_MEMBER_FIELDS}
    }
  }
`

const REMOVE_SUBSCRIPTION_MEMBER_MUTATION = `
  mutation RemoveSubscriptionMember($subscriptionId: ID!, $userId: ID!) {
    removeSubscriptionMember(subscriptionId: $subscriptionId, userId: $userId) {
      ${STANDALONE_MEMBER_FIELDS}
    }
  }
`

export class GraphqlWalletService implements WalletService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async myWallet(): Promise<Wallet | null> {
    const data = await this.client.request<{ myWallet: Wallet | null }>(MY_WALLET_QUERY)
    return data.myWallet
  }

  async subscriptionPlans(): Promise<SubscriptionPlan[]> {
    const data = await this.client.request<{ subscriptionPlans: SubscriptionPlan[] }>(
      SUBSCRIPTION_PLANS_QUERY,
    )
    return data.subscriptionPlans
  }

  async mySubscription(): Promise<PlanSubscription | null> {
    const data = await this.client.request<{ mySubscription: PlanSubscriptionWire | null }>(
      MY_SUBSCRIPTION_QUERY,
    )
    return data.mySubscription ? toPlanSubscription(data.mySubscription) : null
  }

  async myMonthlyAllowance(): Promise<UserMonthlyAllowance | null> {
    const data = await this.client.request<{ myMonthlyAllowance: UserMonthlyAllowance | null }>(
      MY_MONTHLY_ALLOWANCE_QUERY,
    )
    return data.myMonthlyAllowance
  }

  async initiateWalletTopUp(amountMinor: number, currency: string): Promise<WalletTransaction> {
    const data = await this.client.request<
      { initiateWalletTopUp: WalletTransaction },
      { amountMinor: number; currency: string }
    >(INITIATE_WALLET_TOP_UP_MUTATION, { amountMinor, currency })
    return data.initiateWalletTopUp
  }

  async subscribeToPlan(planId: string): Promise<PlanSubscription> {
    const data = await this.client.request<
      { subscribeToPlan: PlanSubscriptionWire },
      { planId: string }
    >(SUBSCRIBE_TO_PLAN_MUTATION, { planId })
    return toPlanSubscription(data.subscribeToPlan)
  }

  async cancelSubscription(id: string): Promise<PlanSubscription> {
    const data = await this.client.request<
      { cancelSubscription: PlanSubscriptionWire },
      { id: string }
    >(CANCEL_SUBSCRIPTION_MUTATION, { id })
    return toPlanSubscription(data.cancelSubscription)
  }

  async addSubscriptionMember(
    subscriptionId: string,
    userId: string,
    isMinor: boolean,
  ): Promise<SubscriptionMember> {
    const data = await this.client.request<
      { addSubscriptionMember: StandaloneSubscriptionMemberWire },
      { subscriptionId: string; userId: string; isMinor: boolean }
    >(ADD_SUBSCRIPTION_MEMBER_MUTATION, { subscriptionId, userId, isMinor })
    return toSubscriptionMember(data.addSubscriptionMember)
  }

  async removeSubscriptionMember(subscriptionId: string, userId: string): Promise<SubscriptionMember> {
    const data = await this.client.request<
      { removeSubscriptionMember: StandaloneSubscriptionMemberWire },
      { subscriptionId: string; userId: string }
    >(REMOVE_SUBSCRIPTION_MEMBER_MUTATION, { subscriptionId, userId })
    return toSubscriptionMember(data.removeSubscriptionMember)
  }
}
