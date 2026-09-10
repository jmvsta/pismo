package com.jvmvstv_v.back.notification.service

import com.jvmvstv_v.back.notification.model.Notification
import com.jvmvstv_v.back.notification.model.NotificationType
import java.util.UUID

interface NotificationService {
    fun notify(userId: UUID, type: NotificationType, title: String, body: String?)
    fun myNotifications(unreadOnly: Boolean): List<Notification>
    fun unreadCount(): Int
    fun markRead(id: UUID): Notification
}
