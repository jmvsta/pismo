package com.jvmvstv_v.back.user.email

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

// No email provider is wired up yet (no SMTP credentials configured anywhere in this project)
// -- this stands in for one the same way the Stripe integration uses a stub API key locally,
// so registration and email verification work end-to-end without a real mail server.
@Component
class LoggingEmailGateway : EmailGateway {
    private val logger = LoggerFactory.getLogger(LoggingEmailGateway::class.java)

    override fun sendVerificationCode(email: String, code: String) {
        logger.info("Verification code for {}: {}", email, code)
    }
}
