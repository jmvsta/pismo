package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageBlockType
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.model.AboutPageMoveDirection
import com.jvmvstv_v.back.about.repository.AboutRepository
import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.stereotype.Service
import java.util.UUID

private const val MIN_CANVAS_HEIGHT = 10.0
private const val MAX_CANVAS_HEIGHT = 300.0
private const val MIN_SLIDE_INTERVAL = 1.0
private const val MAX_SLIDE_INTERVAL = 120.0
private const val MAX_GALLERY_PHOTOS = 30
private val ICON_NAME_PATTERN = Regex("^[a-z0-9-]{1,40}$")

@Service
class AboutServiceImpl(
    private val aboutRepository: AboutRepository,
    private val imageService: ImageService,
) : AboutService {
    override fun aboutPage(): AboutPage = aboutRepository.find()

    override fun addCanvas(): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.addCanvas(UUID.randomUUID())
    }

    override fun moveCanvas(id: UUID, direction: AboutPageMoveDirection): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.moveCanvas(id, direction)
    }

    override fun updateCanvasHeight(id: UUID, height: Double): AboutPage {
        CurrentUser.requireModerator()
        if (height !in MIN_CANVAS_HEIGHT..MAX_CANVAS_HEIGHT) {
            throw AuthException("Canvas height must be between $MIN_CANVAS_HEIGHT and $MAX_CANVAS_HEIGHT")
        }
        return aboutRepository.updateCanvasHeight(id, height)
    }

    override fun updateCanvasRounded(id: UUID, rounded: Boolean): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.updateCanvasRounded(id, rounded)
    }

    override fun updateBlockRounded(id: UUID, rounded: Boolean): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.updateBlockRounded(id, rounded)
    }

    override fun updateCanvasBordered(id: UUID, bordered: Boolean): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.updateCanvasBordered(id, bordered)
    }

    override fun updateBlockHighlighted(id: UUID, highlighted: Boolean): AboutPage {
        CurrentUser.requireModerator()
        requireBlockType(id, AboutPageBlockType.TEXT, "Only text blocks can be highlighted")
        return aboutRepository.updateBlockHighlighted(id, highlighted)
    }

    override fun updateBlockIcon(id: UUID, icon: String?): AboutPage {
        CurrentUser.requireModerator()
        requireBlockType(id, AboutPageBlockType.BUTTON, "Only buttons can have an icon")
        val name = icon?.trim()?.takeIf { it.isNotEmpty() }
        if (name != null && !ICON_NAME_PATTERN.matches(name)) throw AuthException("Invalid icon name")
        return aboutRepository.updateBlockIcon(id, name)
    }

    override fun updateCanvasBackground(id: UUID, mimeType: String, imageBase64: String): AboutPage {
        CurrentUser.requireModerator()
        val image = imageService.store(ImageOwnerType.ABOUT_PAGE_PHOTO, id, mimeType, imageBase64)
        aboutRepository.setCanvasBackground(id, image.id)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun removeCanvasBackground(id: UUID): AboutPage {
        CurrentUser.requireModerator()
        aboutRepository.setCanvasBackground(id, null)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun removeCanvas(id: UUID): AboutPage {
        CurrentUser.requireModerator()
        aboutRepository.removeCanvas(id).forEach { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun addTextBlock(canvasId: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage {
        CurrentUser.requireModerator()
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
        CurrentUser.requireModerator()
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
        CurrentUser.requireModerator()
        requireValidLayout(x, y, width, height)
        requireNonBlankLink(linkUrl)
        return aboutRepository.addButtonBlock(UUID.randomUUID(), canvasId, text, linkUrl, x, y, width, height)
    }

    override fun addGalleryBlock(
        canvasId: UUID,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
        slideIntervalSeconds: Double,
    ): AboutPage {
        CurrentUser.requireModerator()
        requireValidLayout(x, y, width, height)
        requireValidSlideInterval(slideIntervalSeconds)
        return aboutRepository.addGalleryBlock(UUID.randomUUID(), canvasId, x, y, width, height, slideIntervalSeconds)
    }

    override fun addGalleryPhoto(blockId: UUID, mimeType: String, imageBase64: String): AboutPage {
        CurrentUser.requireModerator()
        requireGalleryBlock(blockId)
        if (aboutRepository.countGalleryPhotos(blockId) >= MAX_GALLERY_PHOTOS) {
            throw AuthException("A gallery can hold at most $MAX_GALLERY_PHOTOS photos")
        }
        val image = imageService.store(ImageOwnerType.ABOUT_PAGE_PHOTO, blockId, mimeType, imageBase64)
        return aboutRepository.addGalleryPhoto(blockId, image.id)
    }

    override fun removeGalleryPhoto(blockId: UUID, imageId: UUID): AboutPage {
        CurrentUser.requireModerator()
        requireGalleryBlock(blockId)
        aboutRepository.removeGalleryPhoto(blockId, imageId)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }

    override fun updateGalleryInterval(id: UUID, slideIntervalSeconds: Double): AboutPage {
        CurrentUser.requireModerator()
        requireGalleryBlock(id)
        requireValidSlideInterval(slideIntervalSeconds)
        return aboutRepository.updateGalleryInterval(id, slideIntervalSeconds)
    }

    override fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage {
        CurrentUser.requireModerator()
        requireValidLayout(x, y, width, height)
        return aboutRepository.updateBlockLayout(id, x, y, width, height)
    }

    override fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.updateBlockAlign(id, align)
    }

    override fun updateBlockLayer(id: UUID, layer: Int): AboutPage {
        CurrentUser.requireModerator()
        if (layer < 1) throw AuthException("Layer must be 1 or higher")
        return aboutRepository.updateBlockLayer(id, layer)
    }

    override fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage {
        CurrentUser.requireModerator()
        return aboutRepository.updateBlockText(id, text, language)
    }

    override fun updateBlockLink(id: UUID, linkUrl: String): AboutPage {
        CurrentUser.requireModerator()
        requireNonBlankLink(linkUrl)
        return aboutRepository.updateBlockLink(id, linkUrl)
    }

    override fun removeBlock(id: UUID): AboutPage {
        CurrentUser.requireModerator()
        aboutRepository.removeBlock(id).forEach { imageService.delete(it) }
        return aboutRepository.find()
    }

    private fun requireGalleryBlock(id: UUID) =
        requireBlockType(id, AboutPageBlockType.GALLERY, "Block $id is not a gallery")

    private fun requireBlockType(id: UUID, type: AboutPageBlockType, message: String) {
        if (aboutRepository.findBlockType(id) != type) throw AuthException(message)
    }

    private fun requireValidSlideInterval(seconds: Double) {
        if (seconds !in MIN_SLIDE_INTERVAL..MAX_SLIDE_INTERVAL) {
            throw AuthException("Slide interval must be between $MIN_SLIDE_INTERVAL and $MAX_SLIDE_INTERVAL seconds")
        }
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
