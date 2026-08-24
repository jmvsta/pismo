package com.jvmvstv_v.back.wallet.stripe

import com.stripe.model.Customer
import com.stripe.model.PaymentMethod
import com.stripe.model.SetupIntent
import com.stripe.model.Subscription
import com.stripe.param.CustomerCreateParams
import com.stripe.param.PaymentMethodAttachParams
import com.stripe.param.SetupIntentCreateParams
import com.stripe.param.SubscriptionUpdateParams
import org.springframework.stereotype.Component

@Component
class StripeGatewayImpl : StripeGateway {
    override fun createCustomer(email: String): String {
        val customer = Customer.create(CustomerCreateParams.builder().setEmail(email).build())
        return customer.id
    }

    override fun createSetupIntent(customerId: String): String {
        val setupIntent = SetupIntent.create(SetupIntentCreateParams.builder().setCustomer(customerId).build())
        return setupIntent.clientSecret
    }

    override fun attachPaymentMethod(customerId: String, paymentMethodId: String): StripePaymentMethodDetails {
        val paymentMethod = PaymentMethod.retrieve(paymentMethodId)
        val attached = paymentMethod.attach(PaymentMethodAttachParams.builder().setCustomer(customerId).build())
        val card = attached.card
        return StripePaymentMethodDetails(
            brand = card?.brand,
            last4 = card?.last4,
            expMonth = card?.expMonth?.toInt(),
            expYear = card?.expYear?.toInt(),
        )
    }

    override fun detachPaymentMethod(paymentMethodId: String) {
        PaymentMethod.retrieve(paymentMethodId).detach()
    }

    override fun cancelSubscription(stripeSubscriptionId: String) {
        Subscription.retrieve(stripeSubscriptionId).cancel()
    }

    override fun setCancelAtPeriodEnd(stripeSubscriptionId: String, cancelAtPeriodEnd: Boolean) {
        Subscription.retrieve(stripeSubscriptionId)
            .update(SubscriptionUpdateParams.builder().setCancelAtPeriodEnd(cancelAtPeriodEnd).build())
    }
}
