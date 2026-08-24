package com.jvmvstv_v.back.common

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.util.UUID

@Component
class SessionAuthenticator(private val securityContextRepository: SecurityContextRepository) {
    fun authenticate(userId: UUID, email: String) {
        val authentication = UsernamePasswordAuthenticationToken(AuthenticatedPrincipal(userId, email), null, emptyList())
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
        val (request, response) = currentRequestResponse()
        securityContextRepository.saveContext(context, request, response)
    }

    fun clear() {
        val (request, response) = currentRequestResponse()
        SecurityContextHolder.clearContext()
        securityContextRepository.saveContext(SecurityContextHolder.createEmptyContext(), request, response)
        request.getSession(false)?.invalidate()
    }

    private fun currentRequestResponse(): Pair<HttpServletRequest, HttpServletResponse> {
        val attributes = RequestContextHolder.currentRequestAttributes() as ServletRequestAttributes
        val response = attributes.response ?: error("No HTTP response available for the current request")
        return attributes.request to response
    }
}
