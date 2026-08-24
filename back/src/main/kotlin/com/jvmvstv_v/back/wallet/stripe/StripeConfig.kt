package com.jvmvstv_v.back.wallet.stripe

import com.stripe.Stripe
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class StripeConfig(
    @Value("\${app.stripe.api-key}") private val apiKey: String,
) {
    @PostConstruct
    fun configure() {
        Stripe.apiKey = apiKey
    }
}
