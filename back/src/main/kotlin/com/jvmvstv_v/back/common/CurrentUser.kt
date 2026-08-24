package com.jvmvstv_v.back.common

import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthException(message: String) : RuntimeException(message)

data class AuthenticatedPrincipal(val id: UUID, val email: String)

object CurrentUser {
    val id: UUID get() = idOrNull ?: throw AuthException("You must be logged in")

    val idOrNull: UUID?
        get() = principal()?.id

    private fun principal(): AuthenticatedPrincipal? =
        SecurityContextHolder.getContext().authentication?.principal as? AuthenticatedPrincipal
}
