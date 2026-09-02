package com.jvmvstv_v.back.notification.repository

import com.jvmvstv_v.back.notification.model.Notification
import com.jvmvstv_v.back.notification.model.NotificationType
import java.util.UUID

interface NotificationRepository {
    fun insert(userId: UUID, type: NotificationType, title: String, body: String?): Notification
    fun findForUser(userId: UUID, unreadOnly: Boolean): List<Notification>
    fun markRead(id: UUID, userId: UUID): Notification
    fun countUnread(userId: UUID): Int
}
