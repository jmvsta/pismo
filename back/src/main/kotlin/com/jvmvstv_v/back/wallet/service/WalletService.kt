package com.jvmvstv_v.back.wallet.service

import com.jvmvstv_v.back.wallet.model.PaymentMethod
import com.jvmvstv_v.back.wallet.model.PlanSubscription
import com.jvmvstv_v.back.wallet.model.SubscriptionMember
import com.jvmvstv_v.back.wallet.model.SubscriptionPlan
import com.jvmvstv_v.back.wallet.model.UserMonthlyAllowance
import com.jvmvstv_v.back.wallet.model.Wallet
import com.jvmvstv_v.back.wallet.model.WalletTransaction
import java.util.UUID

interface WalletService {
    fun myWallet(): Wallet?
    fun plans(): List<SubscriptionPlan>
    fun mySubscription(): PlanSubscription?
    fun myMonthlyAllowance(): UserMonthlyAllowance?
    fun initiateTopUp(amountMinor: Int, currency: String): WalletTransaction
    fun subscribeToPlan(planId: Int): PlanSubscription
    fun cancelSubscription(id: UUID): PlanSubscription
    fun addSubscriptionMember(subscriptionId: UUID, userId: UUID, isMinor: Boolean): SubscriptionMember
    fun removeSubscriptionMember(subscriptionId: UUID, userId: UUID): SubscriptionMember
    fun setAutoRenew(subscriptionId: UUID, autoRenew: Boolean): PlanSubscription
    fun myPaymentMethods(): List<PaymentMethod>
    fun createSetupIntent(): String
    fun addCard(paymentMethodId: String): PaymentMethod
    fun removeCard(id: UUID): Boolean
}
