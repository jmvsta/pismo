package com.jvmvstv_v.back.notification.model

import java.util.UUID

enum class NotificationType { PEN_PAL_REQUEST, LETTER_SENT, LETTER_DELIVERED }

data class Notification(
    val id: UUID,
    val type: NotificationType,
    val title: String,
    val body: String?,
    val readAt: String?,
    val createdAt: String,
)
