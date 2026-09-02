package com.jvmvstv_v.back.user.email

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component

// Sends through Google's SMTP relay (smtp.gmail.com, configured via the standard spring.mail.*
// properties in application-prod.yaml) once app.email.provider=google and real credentials
// (a Gmail/Workspace address plus an app password or OAuth2 token) are supplied via
// GMAIL_USERNAME/GMAIL_APP_PASSWORD -- see LoggingEmailGateway for the local/default stand-in.
@Component
@ConditionalOnProperty(prefix = "app.email", name = ["provider"], havingValue = "google")
class GoogleSmtpEmailGateway(
    private val mailSender: JavaMailSender,
    @Value("\${app.email.from}") private val fromAddress: String,
) : EmailGateway {
    override fun sendVerificationCode(email: String, code: String) {
        val message = SimpleMailMessage()
        message.setFrom(fromAddress)
        message.setTo(email)
        message.setSubject("Your Pismo na DAR verification code")
        message.setText(
            "Your verification code is $code\n\nEnter it on the site to confirm your email address. " +
                "This code expires in 24 hours.",
        )
        mailSender.send(message)
    }
}
