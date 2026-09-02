package com.jvmvstv_v.back.notification.websocket

import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.UUID

// Push-only channel: the client never sends anything meaningful over this socket (queries/
// mutations still go through the regular GraphQL HTTP endpoint), so incoming text frames are
// ignored rather than handled.
@Component
class NotificationWebSocketHandler(
    private val registry: NotificationSocketRegistry,
) : TextWebSocketHandler() {
    override fun afterConnectionEstablished(session: WebSocketSession) {
        registry.register(userIdOf(session), session)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        registry.unregister(userIdOf(session), session)
    }

    private fun userIdOf(session: WebSocketSession): UUID =
        session.attributes[NOTIFICATION_SESSION_USER_ID] as? UUID
            ?: error("Notification socket ${session.id} has no authenticated user attached")
}
