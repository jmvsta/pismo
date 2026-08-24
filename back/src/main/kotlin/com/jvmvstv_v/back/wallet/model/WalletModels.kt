package com.jvmvstv_v.back.wallet.model

import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

enum class WalletTransactionType { TOP_UP, STAMP_PURCHASE, SUBSCRIPTION, REFUND, BONUS, ADJUSTMENT }

enum class WalletTransactionStatus { PENDING, COMPLETED, FAILED, CANCELLED }

enum class BillingPeriod { MONTHLY, YEARLY }

enum class SubscriptionStatus { ACTIVE, PAST_DUE, CANCELLED, EXPIRED }

enum class SubscriptionMemberRole { OWNER, MEMBER }

data class Wallet(
    val id: UUID,
    val user: User,
    val balanceMinor: Int,
    val currency: String,
    val createdAt: String,
    val updatedAt: String,
    val transactions: List<WalletTransaction>,
)

data class WalletTransaction(
    val id: UUID,
    val amountMinor: Int,
    val currency: String,
    val type: WalletTransactionType,
    val status: WalletTransactionStatus,
    val letter: Letter?,
    val externalRef: String?,
    val description: String?,
    val createdAt: String,
    val settledAt: String?,
)

data class SubscriptionPlan(
    val id: Int,
    val code: String,
    val name: String,
    val description: String?,
    val priceMinor: Int,
    val currency: String,
    val billingPeriod: BillingPeriod,
    val active: Boolean,
    val lettersSendPerMonth: Int,
    val lettersReceivePerMonth: Int,
    val addressAllowance: Int,
    val maxMembers: Int,
)

data class PlanSubscription(
    val id: UUID,
    val user: User,
    val plan: SubscriptionPlan,
    val status: SubscriptionStatus,
    val startedAt: String,
    val currentPeriodStart: String,
    val currentPeriodEnd: String,
    val cancelledAt: String?,
    val externalRef: String?,
    val autoRenew: Boolean,
    val members: List<SubscriptionMember>,
    val createdAt: String,
    val updatedAt: String,
)

data class SubscriptionMember(
    val subscription: PlanSubscription,
    val user: User,
    val role: SubscriptionMemberRole,
    val isMinor: Boolean,
    val addedAt: String,
    val removedAt: String?,
)

data class PaymentMethod(
    val id: UUID,
    val brand: String?,
    val last4: String?,
    val expMonth: Int?,
    val expYear: Int?,
    val isDefault: Boolean,
    val createdAt: String,
)

data class UserMonthlyAllowance(
    val user: User,
    val period: String,
    val lettersSent: Int,
    val lettersReceived: Int,
    val addressesUnlocked: Int,
    val bonusSendQuota: Int,
    val bonusReceiveQuota: Int,
    val bonusAddresses: Int,
    val createdAt: String,
    val updatedAt: String,
)
