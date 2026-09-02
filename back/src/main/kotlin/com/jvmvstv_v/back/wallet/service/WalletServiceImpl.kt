package com.jvmvstv_v.back.wallet.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.user.repository.UserRepository
import com.jvmvstv_v.back.wallet.model.PaymentMethod
import com.jvmvstv_v.back.wallet.model.PlanSubscription
import com.jvmvstv_v.back.wallet.model.SubscriptionMember
import com.jvmvstv_v.back.wallet.model.SubscriptionPlan
import com.jvmvstv_v.back.wallet.model.UserMonthlyAllowance
import com.jvmvstv_v.back.wallet.model.Wallet
import com.jvmvstv_v.back.wallet.model.WalletTransaction
import com.jvmvstv_v.back.wallet.repository.WalletRepository
import com.jvmvstv_v.back.wallet.stripe.StripeGateway
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WalletServiceImpl(
    private val walletRepository: WalletRepository,
    private val userRepository: UserRepository,
    private val stripeGateway: StripeGateway,
) : WalletService {
    override fun myWallet(): Wallet? = walletRepository.findWalletForUser(CurrentUser.id)

    override fun plans(): List<SubscriptionPlan> = walletRepository.findPlans()

    override fun mySubscription(): PlanSubscription? = walletRepository.findSubscriptionForUser(CurrentUser.id)

    override fun myMonthlyAllowance(): UserMonthlyAllowance? =
        walletRepository.findMonthlyAllowanceForUser(CurrentUser.id)

    override fun initiateTopUp(amountMinor: Int, currency: String): WalletTransaction {
        if (amountMinor <= 0) throw AuthException("Top-up amount must be positive")
        if (!currency.matches(Regex("^[A-Z]{3}$"))) throw AuthException("Currency must be a 3-letter code, e.g. EUR")
        return walletRepository.initiateTopUp(CurrentUser.id, amountMinor, currency)
    }

    override fun subscribeToPlan(planId: Int): PlanSubscription =
        walletRepository.subscribeToPlan(CurrentUser.id, planId)

    override fun cancelSubscription(id: UUID): PlanSubscription {
        requireOwnSubscription(id)
        walletRepository.findStripeSubscriptionId(id)?.let { stripeGateway.cancelSubscription(it) }
        return walletRepository.cancelSubscription(id)
    }

    override fun addSubscriptionMember(subscriptionId: UUID, userId: UUID, isMinor: Boolean): SubscriptionMember {
        requireOwnSubscription(subscriptionId)
        return walletRepository.addSubscriptionMember(subscriptionId, userId, isMinor)
    }

    override fun removeSubscriptionMember(subscriptionId: UUID, userId: UUID): SubscriptionMember {
        requireOwnSubscription(subscriptionId)
        return walletRepository.removeSubscriptionMember(subscriptionId, userId)
    }

    override fun setAutoRenew(subscriptionId: UUID, autoRenew: Boolean): PlanSubscription {
        requireOwnSubscription(subscriptionId)
        walletRepository.findStripeSubscriptionId(subscriptionId)?.let {
            stripeGateway.setCancelAtPeriodEnd(it, cancelAtPeriodEnd = !autoRenew)
        }
        return walletRepository.updateAutoRenew(subscriptionId, autoRenew)
    }

    private fun requireOwnSubscription(subscriptionId: UUID) {
        if (walletRepository.findSubscriptionForUser(CurrentUser.id)?.id != subscriptionId) {
            throw AuthException("You don't have a subscription to manage")
        }
    }

    override fun myPaymentMethods(): List<PaymentMethod> = walletRepository.findPaymentMethodsForUser(CurrentUser.id)

    override fun createSetupIntent(): String {
        val customerId = ensureStripeCustomerId()
        return stripeGateway.createSetupIntent(customerId)
    }

    override fun addCard(paymentMethodId: String): PaymentMethod {
        val customerId = ensureStripeCustomerId()
        val details = stripeGateway.attachPaymentMethod(customerId, paymentMethodId)
        return walletRepository.savePaymentMethod(
            CurrentUser.id, paymentMethodId, details.brand, details.last4, details.expMonth, details.expYear,
        )
    }

    override fun removeCard(id: UUID): Boolean {
        val owned = walletRepository.findPaymentMethodsForUser(CurrentUser.id).any { it.id == id }
        if (!owned) throw AuthException("This isn't your payment method")
        walletRepository.findStripePaymentMethodId(id)?.let { stripeGateway.detachPaymentMethod(it) }
        return walletRepository.removePaymentMethod(id)
    }

    private fun ensureStripeCustomerId(): String =
        walletRepository.ensureStripeCustomerId(CurrentUser.id) {
            val email = userRepository.findById(CurrentUser.id)?.email ?: error("User ${CurrentUser.id} not found")
            stripeGateway.createCustomer(email)
        }
}
