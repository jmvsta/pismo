package com.jvmvstv_v.back.security

import com.jvmvstv_v.back.common.logging.LogContext
import com.jvmvstv_v.back.user.repository.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class BearerTokenAuthenticationFilter(
    private val userRepository: UserRepository,
) : OncePerRequestFilter() {
    private val logger = LoggerFactory.getLogger(BearerTokenAuthenticationFilter::class.java)

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val token = header.removePrefix("Bearer ").trim()
            val principal = userRepository.findActiveUserByToken(token)
            if (principal != null) {
                SecurityContextHolder.getContext().authentication =
                    UsernamePasswordAuthenticationToken(principal, null, emptyList())
                MDC.put(LogContext.USER_ID, principal.id.toString())
            } else {
                logger.debug("Ignoring bearer token that matches no active user (unknown, expired or suspended account)")
            }
        }
        filterChain.doFilter(request, response)
    }
}
