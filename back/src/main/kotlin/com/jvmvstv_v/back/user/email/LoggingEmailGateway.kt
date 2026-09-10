package com.jvmvstv_v.back.user.email

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

// Default when app.email.provider isn't set to "google" (see GoogleSmtpEmailGateway) --
// no SMTP credentials configured anywhere in this project by default -- this stands in for
// a real provider the same way the Stripe integration uses a stub API key locally, so
// registration and email verification work end-to-end without a real mail server.
@Component
@ConditionalOnProperty(prefix = "app.email", name = ["provider"], havingValue = "logging", matchIfMissing = true)
class LoggingEmailGateway : EmailGateway {
    private val logger = LoggerFactory.getLogger(LoggingEmailGateway::class.java)

    override fun sendVerificationCode(email: String, code: String) {
        logger.info("Verification code for {}: {}", email, code)
    }
}
