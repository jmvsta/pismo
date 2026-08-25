package com.jvmvstv_v.back.common

import com.jvmvstv_v.back.user.model.UserRole
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthException(message: String) : RuntimeException(message)

data class AuthenticatedPrincipal(val id: UUID, val email: String, val role: UserRole)

object CurrentUser {
    val id: UUID get() = idOrNull ?: throw AuthException("You must be logged in")

    val idOrNull: UUID?
        get() = principal()?.id

    val role: UserRole get() = principal()?.role ?: throw AuthException("You must be logged in")

    fun requireAdmin() {
        if (role != UserRole.ADMIN) throw AuthException("Admin access required")
    }

    fun requireModerator() {
        if (role != UserRole.ADMIN && role != UserRole.MODERATOR) {
            throw AuthException("Moderator access required")
        }
    }

    private fun principal(): AuthenticatedPrincipal? =
        SecurityContextHolder.getContext().authentication?.principal as? AuthenticatedPrincipal
}
