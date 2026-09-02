package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.repository.AboutRepository
import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AboutServiceImpl(
    private val aboutRepository: AboutRepository,
    private val imageService: ImageService,
) : AboutService {
    override fun aboutPage(): AboutPage = aboutRepository.find()

    override fun updateBody(body: String): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBody(body, CurrentUser.id)
    }

    override fun addTextBlock(text: String, x: Double, y: Double, width: Double, height: Double): AboutPage {
        CurrentUser.requireAdmin()
        requireValidLayout(x, y, width, height)
        return aboutRepository.addTextBlock(UUID.randomUUID(), text, x, y, width, height)
    }

    override fun addPhotoBlock(
        mimeType: String,
        imageBase64: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage {
        CurrentUser.requireAdmin()
        requireValidLayout(x, y, width, height)
        val blockId = UUID.randomUUID()
        val image = imageService.store(ImageOwnerType.ABOUT_PAGE_PHOTO, blockId, mimeType, imageBase64)
        return aboutRepository.addPhotoBlock(blockId, image.id, x, y, width, height)
    }

    override fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage {
        CurrentUser.requireAdmin()
        requireValidLayout(x, y, width, height)
        return aboutRepository.updateBlockLayout(id, x, y, width, height)
    }

    override fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBlockAlign(id, align)
    }

    override fun updateBlockText(id: UUID, text: String): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBlockText(id, text)
    }

    override fun removeBlock(id: UUID): AboutPage {
        CurrentUser.requireAdmin()
        aboutRepository.removeBlock(id)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    private fun requireValidLayout(x: Double, y: Double, width: Double, height: Double) {
        if (x !in 0.0..100.0 || y !in 0.0..100.0) {
            throw AuthException("Block position must be between 0 and 100")
        }
        if (width !in 0.01..100.0 || height !in 0.01..100.0) {
            throw AuthException("Block size must be greater than 0 and at most 100")
        }
    }
}
