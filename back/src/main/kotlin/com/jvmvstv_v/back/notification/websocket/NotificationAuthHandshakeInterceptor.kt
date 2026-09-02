package com.jvmvstv_v.back.notification.websocket

import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.http.server.ServletServerHttpRequest
import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor

const val NOTIFICATION_SESSION_USER_ID = "userId"

// The bearer token travels as a query parameter (?token=...) because browser WebSocket clients
// can't set an Authorization header on the handshake request the way a fetch/XHR call can.
// A rejected/missing/expired token fails the handshake outright (returns false) rather than
// accepting the connection and closing it later.
@Component
class NotificationAuthHandshakeInterceptor(private val userRepository: UserRepository) : HandshakeInterceptor {
    override fun beforeHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        attributes: MutableMap<String, Any>,
    ): Boolean {
        val token = tokenFrom(request) ?: return false
        val principal = userRepository.findActiveUserByToken(token) ?: return false
        attributes[NOTIFICATION_SESSION_USER_ID] = principal.id
        return true
    }

    override fun afterHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        exception: Exception?,
    ) = Unit

    private fun tokenFrom(request: ServerHttpRequest): String? {
        if (request !is ServletServerHttpRequest) return null
        return request.servletRequest.getParameter("token")
    }
}
