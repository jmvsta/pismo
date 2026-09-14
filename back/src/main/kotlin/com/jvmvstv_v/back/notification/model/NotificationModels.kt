package com.jvmvstv_v.back.notification.model

import java.util.UUID

enum class NotificationType { PEN_PAL_REQUEST, PEN_PAL_ACCEPTED, LETTER_SENT, LETTER_DELIVERED }

data class Notification(
    val id: UUID,
    val type: NotificationType,
    val title: String,
    val body: String?,
    val subjectId: UUID?,
    val readAt: String?,
    val createdAt: String,
)
