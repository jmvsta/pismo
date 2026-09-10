package com.jvmvstv_v.back.user.email

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.stereotype.Component

// Stands in for a real provider (see ResendEmailGateway) whenever app.email.resend.api-key
// isn't set -- local dev and any environment without a mail provider configured -- so
// registration and email verification work end-to-end without sending real mail. Checked
// via a blank-string expression, not @ConditionalOnProperty, because in prod the property
// is always defined as ${RESEND_API_KEY} -- present-but-empty when that secret isn't set
// yet, which @ConditionalOnProperty treats as "present" and would create both beans.
@Component
@ConditionalOnExpression("'\${app.email.resend.api-key:}'.isBlank()")
class LoggingEmailGateway : EmailGateway {
    private val logger = LoggerFactory.getLogger(LoggingEmailGateway::class.java)

    override fun sendVerificationCode(email: String, code: String) {
        logger.info("Verification code for {}: {}", email, code)
    }
}
