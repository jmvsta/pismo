package com.jvmvstv_v.back.notification.websocket

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class NotificationWebSocketConfig(
    private val notificationWebSocketHandler: NotificationWebSocketHandler,
    private val notificationAuthHandshakeInterceptor: NotificationAuthHandshakeInterceptor,
    @Value("\${app.cors.allowed-origins}") private val allowedOrigins: List<String>,
) : WebSocketConfigurer {
    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(notificationWebSocketHandler, "/ws/notifications")
            .addInterceptors(notificationAuthHandshakeInterceptor)
            .setAllowedOrigins(*allowedOrigins.toTypedArray())
    }
}
