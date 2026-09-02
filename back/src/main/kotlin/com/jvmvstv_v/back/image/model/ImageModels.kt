package com.jvmvstv_v.back.image.model

import java.util.UUID

enum class ImageOwnerType { USER_AVATAR, FORUM_POST_PHOTO, FORUM_REPLY_PHOTO }

data class Image(
    val id: UUID,
    val ownerType: ImageOwnerType,
    val ownerId: UUID,
    val mimeType: String,
    val data: ByteArray,
    val createdAt: String,
)
