package com.jvmvstv_v.back.notification.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.notification.model.Notification
import com.jvmvstv_v.back.notification.model.NotificationType
import com.jvmvstv_v.back.notification.repository.NotificationRepository
import com.jvmvstv_v.back.notification.websocket.NotificationSocketRegistry
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class NotificationServiceImpl(
    private val notificationRepository: NotificationRepository,
    private val notificationSocketRegistry: NotificationSocketRegistry,
) : NotificationService {
    private val logger = LoggerFactory.getLogger(NotificationServiceImpl::class.java)

    override fun notify(userId: UUID, type: NotificationType, title: String, body: String?, subjectId: UUID?) {
        val notification = notificationRepository.insert(userId, type, title, body, subjectId)
        val delivered = notificationSocketRegistry.send(userId, notification)
        logger.info("Notification {} ({}) stored for user {}; pushed to {} open connection(s)", notification.id, type, userId, delivered)
    }

    override fun myNotifications(unreadOnly: Boolean): List<Notification> =
        notificationRepository.findForUser(CurrentUser.id, unreadOnly)

    override fun unreadCount(): Int = notificationRepository.countUnread(CurrentUser.id)

    override fun markRead(id: UUID): Notification = notificationRepository.markRead(id, CurrentUser.id)
}
