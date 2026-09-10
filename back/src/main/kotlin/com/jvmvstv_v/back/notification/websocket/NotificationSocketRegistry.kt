package com.jvmvstv_v.back.notification.websocket

import tools.jackson.databind.ObjectMapper
import com.jvmvstv_v.back.notification.model.Notification
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArraySet

// Sessions are grouped by user id (not connection id) so a notification reaches every tab/
// device a user has open at once; a session is dropped the moment a send to it fails rather
// than waiting for afterConnectionClosed, since a half-dead socket can otherwise linger.
@Component
class NotificationSocketRegistry(private val objectMapper: ObjectMapper) {
    private val logger = LoggerFactory.getLogger(NotificationSocketRegistry::class.java)
    private val sessionsByUser = ConcurrentHashMap<UUID, CopyOnWriteArraySet<WebSocketSession>>()

    fun register(userId: UUID, session: WebSocketSession) {
        sessionsByUser.computeIfAbsent(userId) { CopyOnWriteArraySet() }.add(session)
    }

    fun unregister(userId: UUID, session: WebSocketSession) {
        sessionsByUser[userId]?.remove(session)
    }

    fun send(userId: UUID, notification: Notification) {
        val sessions = sessionsByUser[userId] ?: return
        val payload = TextMessage(objectMapper.writeValueAsString(notification))
        sessions.forEach { session ->
            try {
                if (session.isOpen) session.sendMessage(payload) else sessions.remove(session)
            } catch (ex: Exception) {
                logger.warn("Dropping dead notification socket for user {}", userId, ex)
                sessions.remove(session)
            }
        }
    }
}
