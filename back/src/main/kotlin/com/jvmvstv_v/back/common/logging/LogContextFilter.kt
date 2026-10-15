package com.jvmvstv_v.back.common.logging

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

private val SAFE_REQUEST_ID = Regex("^[A-Za-z0-9._-]{1,64}$")

// Runs before Spring Security so every log line of a request -- including the bearer-token
// lookup -- carries the same requestId. The id is also returned in the X-Request-Id response
// header, so a failing request seen in the browser can be matched to its server-side log lines.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class LogContextFilter : OncePerRequestFilter() {
    private val logger = LoggerFactory.getLogger(LogContextFilter::class.java)

    override fun shouldNotFilterAsyncDispatch(): Boolean = false

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val requestId = request.getHeader(LogContext.REQUEST_ID_HEADER)?.takeIf { SAFE_REQUEST_ID.matches(it) }
            ?: UUID.randomUUID().toString().substring(0, 8)
        MDC.put(LogContext.REQUEST_ID, requestId)
        response.setHeader(LogContext.REQUEST_ID_HEADER, requestId)
        val startedAt = System.nanoTime()
        try {
            filterChain.doFilter(request, response)
        } catch (ex: Exception) {
            logger.warn("HTTP {} {} failed with {}: {}", request.method, request.requestURI, ex.javaClass.simpleName, ex.message)
            throw ex
        } finally {
            if (!request.requestURI.startsWith("/actuator")) {
                val tookMs = (System.nanoTime() - startedAt) / 1_000_000
                if (response.status >= 500) {
                    logger.warn("HTTP {} {} -> {} in {}ms", request.method, request.requestURI, response.status, tookMs)
                } else {
                    logger.debug("HTTP {} {} -> {} in {}ms", request.method, request.requestURI, response.status, tookMs)
                }
            }
            MDC.remove(LogContext.REQUEST_ID)
            MDC.remove(LogContext.USER_ID)
        }
    }
}
