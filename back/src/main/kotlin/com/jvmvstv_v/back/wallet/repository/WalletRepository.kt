package com.jvmvstv_v.back.wallet.repository

import com.jvmvstv_v.back.wallet.model.PaymentMethod
import com.jvmvstv_v.back.wallet.model.PlanSubscription
import com.jvmvstv_v.back.wallet.model.SubscriptionMember
import com.jvmvstv_v.back.wallet.model.SubscriptionPlan
import com.jvmvstv_v.back.wallet.model.UserMonthlyAllowance
import com.jvmvstv_v.back.wallet.model.Wallet
import com.jvmvstv_v.back.wallet.model.WalletTransaction
import java.util.UUID

interface WalletRepository {
    fun findWalletForUser(userId: UUID): Wallet?
    fun findPlans(): List<SubscriptionPlan>
    fun findSubscriptionForUser(userId: UUID): PlanSubscription?
    fun findMonthlyAllowanceForUser(userId: UUID): UserMonthlyAllowance?
    fun initiateTopUp(userId: UUID, amountMinor: Int, currency: String): WalletTransaction
    fun subscribeToPlan(userId: UUID, planId: Int): PlanSubscription
    fun cancelSubscription(id: UUID): PlanSubscription
    fun addSubscriptionMember(subscriptionId: UUID, userId: UUID, isMinor: Boolean): SubscriptionMember
    fun removeSubscriptionMember(subscriptionId: UUID, userId: UUID): SubscriptionMember
    fun updateAutoRenew(subscriptionId: UUID, autoRenew: Boolean): PlanSubscription
    fun findStripeSubscriptionId(subscriptionId: UUID): String?
    fun ensureStripeCustomerId(userId: UUID, create: () -> String): String
    fun findPaymentMethodsForUser(userId: UUID): List<PaymentMethod>
    fun findPaymentMethodById(id: UUID): PaymentMethod?
    fun savePaymentMethod(
        userId: UUID,
        stripePaymentMethodId: String,
        brand: String?,
        last4: String?,
        expMonth: Int?,
        expYear: Int?,
    ): PaymentMethod
    fun removePaymentMethod(id: UUID): Boolean
    fun findStripePaymentMethodId(id: UUID): String?
}
