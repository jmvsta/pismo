package com.jvmvstv_v.back.image.repository

import com.jvmvstv_v.back.image.model.Image
import com.jvmvstv_v.back.image.model.ImageOwnerType
import java.util.UUID

interface ImageRepository {
    fun findById(id: UUID): Image?
    fun insert(ownerType: ImageOwnerType, ownerId: UUID, mimeType: String, data: ByteArray): Image
    fun deleteById(id: UUID)

    /** Copies an image's bytes into a new row owned by [ownerId]. Returns the new id, or null if the source doesn't exist. */
    fun duplicate(sourceId: UUID, ownerId: UUID): UUID?
}
