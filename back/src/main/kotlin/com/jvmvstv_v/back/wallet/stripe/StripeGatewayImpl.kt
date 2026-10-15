package com.jvmvstv_v.back.wallet.stripe

import com.stripe.exception.StripeException
import com.stripe.model.Customer
import com.stripe.model.PaymentMethod
import com.stripe.model.SetupIntent
import com.stripe.model.Subscription
import com.stripe.param.CustomerCreateParams
import com.stripe.param.PaymentMethodAttachParams
import com.stripe.param.SetupIntentCreateParams
import com.stripe.param.SubscriptionUpdateParams
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

// Every Stripe call is logged with Stripe's own ids (never emails or card data). A failure is
// logged with Stripe's error code and request id -- the id Stripe support asks for -- and then
// rethrown unchanged.
@Component
class StripeGatewayImpl : StripeGateway {
    private val logger = LoggerFactory.getLogger(StripeGatewayImpl::class.java)

    override fun createCustomer(email: String): String = call("create customer") {
        val customer = Customer.create(CustomerCreateParams.builder().setEmail(email).build())
        logger.info("Stripe customer {} created", customer.id)
        customer.id
    }

    override fun createSetupIntent(customerId: String): String = call("create setup intent") {
        val setupIntent = SetupIntent.create(SetupIntentCreateParams.builder().setCustomer(customerId).build())
        logger.info("Stripe setup intent {} created for customer {}", setupIntent.id, customerId)
        setupIntent.clientSecret
    }

    override fun attachPaymentMethod(customerId: String, paymentMethodId: String): StripePaymentMethodDetails =
        call("attach payment method") {
            val paymentMethod = PaymentMethod.retrieve(paymentMethodId)
            val attached = paymentMethod.attach(PaymentMethodAttachParams.builder().setCustomer(customerId).build())
            val card = attached.card
            logger.info("Stripe payment method {} attached to customer {}", paymentMethodId, customerId)
            StripePaymentMethodDetails(
                brand = card?.brand,
                last4 = card?.last4,
                expMonth = card?.expMonth?.toInt(),
                expYear = card?.expYear?.toInt(),
            )
        }

    override fun detachPaymentMethod(paymentMethodId: String) = call("detach payment method") {
        PaymentMethod.retrieve(paymentMethodId).detach()
        logger.info("Stripe payment method {} detached", paymentMethodId)
        Unit
    }

    override fun cancelSubscription(stripeSubscriptionId: String) = call("cancel subscription") {
        Subscription.retrieve(stripeSubscriptionId).cancel()
        logger.info("Stripe subscription {} cancelled", stripeSubscriptionId)
        Unit
    }

    override fun setCancelAtPeriodEnd(stripeSubscriptionId: String, cancelAtPeriodEnd: Boolean) =
        call("update subscription") {
            Subscription.retrieve(stripeSubscriptionId)
                .update(SubscriptionUpdateParams.builder().setCancelAtPeriodEnd(cancelAtPeriodEnd).build())
            logger.info("Stripe subscription {} cancelAtPeriodEnd set to {}", stripeSubscriptionId, cancelAtPeriodEnd)
            Unit
        }

    private fun <T> call(what: String, block: () -> T): T {
        try {
            return block()
        } catch (ex: StripeException) {
            logger.warn(
                "Stripe {} failed: code={} status={} requestId={}: {}",
                what, ex.code, ex.statusCode, ex.requestId, ex.message,
            )
            throw ex
        }
    }
}
