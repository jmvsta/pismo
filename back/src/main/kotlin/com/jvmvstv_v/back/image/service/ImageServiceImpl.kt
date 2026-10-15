package com.jvmvstv_v.back.image.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.image.model.Image
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.repository.ImageRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.Base64
import java.util.UUID

private val ALLOWED_MIME_TYPES = setOf("image/png", "image/jpeg", "image/webp", "image/gif")
private const val MAX_IMAGE_BYTES = 5 * 1024 * 1024

@Service
class ImageServiceImpl(private val imageRepository: ImageRepository) : ImageService {
    private val logger = LoggerFactory.getLogger(ImageServiceImpl::class.java)

    override fun get(id: UUID): Image? = imageRepository.findById(id)

    override fun store(ownerType: ImageOwnerType, ownerId: UUID, mimeType: String, base64Data: String): Image {
        if (mimeType !in ALLOWED_MIME_TYPES) throw AuthException("Unsupported image type: $mimeType")
        val data = decode(base64Data)
        if (data.size > MAX_IMAGE_BYTES) {
            throw AuthException("Image is too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB)")
        }
        val image = imageRepository.insert(ownerType, ownerId, mimeType, data)
        logger.info("Stored {} image {} for owner {} ({}, {} bytes)", ownerType, image.id, ownerId, mimeType, data.size)
        return image
    }

    override fun delete(id: UUID) {
        imageRepository.deleteById(id)
        logger.debug("Deleted image {}", id)
    }

    override fun duplicate(id: UUID, ownerId: UUID): UUID {
        val copyId = imageRepository.duplicate(id, ownerId) ?: throw AuthException("Image not found")
        logger.info("Duplicated image {} as {} for owner {}", id, copyId, ownerId)
        return copyId
    }

    private fun decode(base64Data: String): ByteArray =
        try {
            Base64.getDecoder().decode(base64Data)
        } catch (e: IllegalArgumentException) {
            throw AuthException("Image data is not valid base64")
        }
}
