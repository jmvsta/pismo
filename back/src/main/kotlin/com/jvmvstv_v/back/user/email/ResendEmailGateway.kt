package com.jvmvstv_v.back.user.email

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException

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

    private val logger = LoggerFactory.getLogger(ResendEmailGateway::class.java)

    // Only the recipient's domain is logged, never the full address or the code.
    override fun sendVerificationCode(email: String, code: String) {
        val domain = email.substringAfter('@', "?")
        try {
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
            logger.info("Verification email sent via Resend to a {} address", domain)
        } catch (ex: RestClientException) {
            logger.error("Resend failed to send a verification email to a {} address: {}", domain, ex.message)
            throw ex
        }
    }
}
