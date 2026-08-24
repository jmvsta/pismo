package com.jvmvstv_v.back.wallet.resolver

import com.jvmvstv_v.back.wallet.model.PaymentMethod
import com.jvmvstv_v.back.wallet.model.PlanSubscription
import com.jvmvstv_v.back.wallet.model.SubscriptionMember
import com.jvmvstv_v.back.wallet.model.SubscriptionPlan
import com.jvmvstv_v.back.wallet.model.UserMonthlyAllowance
import com.jvmvstv_v.back.wallet.model.Wallet
import com.jvmvstv_v.back.wallet.model.WalletTransaction
import com.jvmvstv_v.back.wallet.service.WalletService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class WalletResolver(private val walletService: WalletService) {
    @QueryMapping
    fun myWallet(): Wallet? = walletService.myWallet()

    @QueryMapping
    fun subscriptionPlans(): List<SubscriptionPlan> = walletService.plans()

    @QueryMapping
    fun mySubscription(): PlanSubscription? = walletService.mySubscription()

    @QueryMapping
    fun myMonthlyAllowance(): UserMonthlyAllowance? = walletService.myMonthlyAllowance()

    @QueryMapping
    fun myPaymentMethods(): List<PaymentMethod> = walletService.myPaymentMethods()

    @MutationMapping
    fun initiateWalletTopUp(@Argument amountMinor: Int, @Argument currency: String): WalletTransaction =
        walletService.initiateTopUp(amountMinor, currency)

    @MutationMapping
    fun subscribeToPlan(@Argument planId: Int): PlanSubscription = walletService.subscribeToPlan(planId)

    @MutationMapping
    fun cancelSubscription(@Argument id: UUID): PlanSubscription = walletService.cancelSubscription(id)

    @MutationMapping
    fun addSubscriptionMember(
        @Argument subscriptionId: UUID,
        @Argument userId: UUID,
        @Argument isMinor: Boolean,
    ): SubscriptionMember = walletService.addSubscriptionMember(subscriptionId, userId, isMinor)

    @MutationMapping
    fun removeSubscriptionMember(@Argument subscriptionId: UUID, @Argument userId: UUID): SubscriptionMember =
        walletService.removeSubscriptionMember(subscriptionId, userId)

    @MutationMapping
    fun setAutoRenew(@Argument subscriptionId: UUID, @Argument autoRenew: Boolean): PlanSubscription =
        walletService.setAutoRenew(subscriptionId, autoRenew)

    @MutationMapping
    fun createSetupIntent(): String = walletService.createSetupIntent()

    @MutationMapping
    fun addCard(@Argument paymentMethodId: String): PaymentMethod = walletService.addCard(paymentMethodId)

    @MutationMapping
    fun removeCard(@Argument id: UUID): Boolean = walletService.removeCard(id)
}
