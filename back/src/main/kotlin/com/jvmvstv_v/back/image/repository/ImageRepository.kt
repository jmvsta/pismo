package com.jvmvstv_v.back.image.repository

import com.jvmvstv_v.back.image.model.Image
import com.jvmvstv_v.back.image.model.ImageOwnerType
import java.util.UUID

interface ImageRepository {
    fun findById(id: UUID): Image?
    fun insert(ownerType: ImageOwnerType, ownerId: UUID, mimeType: String, data: ByteArray): Image
    fun deleteById(id: UUID)
}
