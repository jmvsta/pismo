package com.jvmvstv_v.back.image.service

import com.jvmvstv_v.back.image.model.Image
import com.jvmvstv_v.back.image.model.ImageOwnerType
import java.util.UUID

interface ImageService {
    fun get(id: UUID): Image?
    fun store(ownerType: ImageOwnerType, ownerId: UUID, mimeType: String, base64Data: String): Image
    fun delete(id: UUID)
}
