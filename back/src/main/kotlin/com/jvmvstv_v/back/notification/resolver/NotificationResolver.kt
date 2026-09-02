package com.jvmvstv_v.back.notification.resolver

import com.jvmvstv_v.back.notification.model.Notification
import com.jvmvstv_v.back.notification.service.NotificationService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class NotificationResolver(private val notificationService: NotificationService) {
    @QueryMapping
    fun myNotifications(@Argument unreadOnly: Boolean?): List<Notification> =
        notificationService.myNotifications(unreadOnly ?: false)

    @QueryMapping
    fun unreadNotificationCount(): Int = notificationService.unreadCount()

    @MutationMapping
    fun markNotificationRead(@Argument id: UUID): Notification = notificationService.markRead(id)
}
