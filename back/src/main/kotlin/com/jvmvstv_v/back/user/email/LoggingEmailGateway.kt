package com.jvmvstv_v.back.user.email

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

// Stands in for a real provider (see ResendEmailGateway) whenever app.email.resend.api-key
// isn't set -- local dev and any environment without a mail provider configured -- so
// registration and email verification work end-to-end without sending real mail.
@Component
@ConditionalOnProperty(prefix = "app.email.resend", name = ["api-key"], matchIfMissing = true)
class LoggingEmailGateway : EmailGateway {
    private val logger = LoggerFactory.getLogger(LoggingEmailGateway::class.java)

    override fun sendVerificationCode(email: String, code: String) {
        logger.info("Verification code for {}: {}", email, code)
    }
}
