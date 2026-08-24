package com.jvmvstv_v.back.wallet.stripe

data class StripePaymentMethodDetails(
    val brand: String?,
    val last4: String?,
    val expMonth: Int?,
    val expYear: Int?,
)

interface StripeGateway {
    fun createCustomer(email: String): String
    fun createSetupIntent(customerId: String): String
    fun attachPaymentMethod(customerId: String, paymentMethodId: String): StripePaymentMethodDetails
    fun detachPaymentMethod(paymentMethodId: String)
    fun cancelSubscription(stripeSubscriptionId: String)
    fun setCancelAtPeriodEnd(stripeSubscriptionId: String, cancelAtPeriodEnd: Boolean)
}
