package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.repository.AboutRepository
import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.stereotype.Service
import java.util.UUID

private const val MIN_CANVAS_HEIGHT = 10.0
private const val MAX_CANVAS_HEIGHT = 300.0

@Service
class AboutServiceImpl(
    private val aboutRepository: AboutRepository,
    private val imageService: ImageService,
) : AboutService {
    override fun aboutPage(): AboutPage = aboutRepository.find()

    override fun updateBody(body: String, language: AboutPageLanguage): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBody(body, language, CurrentUser.id)
    }

    override fun addCanvas(): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.addCanvas(UUID.randomUUID())
    }

    override fun updateCanvasHeight(id: UUID, height: Double): AboutPage {
        CurrentUser.requireAdmin()
        if (height !in MIN_CANVAS_HEIGHT..MAX_CANVAS_HEIGHT) {
            throw AuthException("Canvas height must be between $MIN_CANVAS_HEIGHT and $MAX_CANVAS_HEIGHT")
        }
        return aboutRepository.updateCanvasHeight(id, height)
    }

    override fun updateCanvasBackground(id: UUID, mimeType: String, imageBase64: String): AboutPage {
        CurrentUser.requireAdmin()
        val image = imageService.store(ImageOwnerType.ABOUT_PAGE_PHOTO, id, mimeType, imageBase64)
        aboutRepository.setCanvasBackground(id, image.id)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun removeCanvasBackground(id: UUID): AboutPage {
        CurrentUser.requireAdmin()
        aboutRepository.setCanvasBackground(id, null)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun removeCanvas(id: UUID): AboutPage {
        CurrentUser.requireAdmin()
        aboutRepository.removeCanvas(id).forEach { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun addTextBlock(canvasId: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage {
        CurrentUser.requireAdmin()
        requireValidLayout(x, y, width, height)
        return aboutRepository.addTextBlock(UUID.randomUUID(), canvasId, text, x, y, width, height)
    }

    override fun addPhotoBlock(
        canvasId: UUID,
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
        return aboutRepository.addPhotoBlock(blockId, canvasId, image.id, x, y, width, height)
    }

    override fun addButtonBlock(
        canvasId: UUID,
        text: String,
        linkUrl: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage {
        CurrentUser.requireAdmin()
        requireValidLayout(x, y, width, height)
        requireNonBlankLink(linkUrl)
        return aboutRepository.addButtonBlock(UUID.randomUUID(), canvasId, text, linkUrl, x, y, width, height)
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

    override fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBlockText(id, text, language)
    }

    override fun updateBlockLink(id: UUID, linkUrl: String): AboutPage {
        CurrentUser.requireAdmin()
        requireNonBlankLink(linkUrl)
        return aboutRepository.updateBlockLink(id, linkUrl)
    }

    override fun removeBlock(id: UUID): AboutPage {
        CurrentUser.requireAdmin()
        aboutRepository.removeBlock(id)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    private fun requireNonBlankLink(linkUrl: String) {
        if (linkUrl.isBlank()) throw AuthException("Button link can't be empty")
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
