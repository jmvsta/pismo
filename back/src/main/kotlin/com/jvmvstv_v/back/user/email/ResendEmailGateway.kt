package com.jvmvstv_v.back.user.email

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
@ConditionalOnExpression("!'\${app.email.resend.api-key:}'.isBlank()")
class ResendEmailGateway(
    @Value("\${app.email.resend.api-key}") apiKey: String,
    @Value("\${app.email.from}") private val fromAddress: String,
) : EmailGateway {
    private val client = RestClient.builder()
        .baseUrl("https://api.resend.com")
        .defaultHeader("Authorization", "Bearer $apiKey")
        .build()

    override fun sendVerificationCode(email: String, code: String) {
        client.post()
            .uri("/emails")
            .body(
                mapOf(
                    "from" to fromAddress,
                    "to" to listOf(email),
                    "subject" to "Your Pismo na Dar verification code",
                    "html" to "<p>Your verification code is <strong>$code</strong>.</p><p>It expires in 24 hours.</p>",
                ),
            )
            .retrieve()
            .toBodilessEntity()
    }
}
