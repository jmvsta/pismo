package com.jvmvstv_v.back.about.resolver

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.model.AboutPageMoveDirection
import com.jvmvstv_v.back.about.service.AboutService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class AboutResolver(private val aboutService: AboutService) {
    @QueryMapping
    fun aboutPage(): AboutPage = aboutService.aboutPage()

    @MutationMapping
    fun addAboutPageCanvas(): AboutPage = aboutService.addCanvas()

    @MutationMapping
    fun moveAboutPageCanvas(@Argument id: UUID, @Argument direction: AboutPageMoveDirection): AboutPage =
        aboutService.moveCanvas(id, direction)

    @MutationMapping
    fun updateAboutPageCanvasHeight(@Argument id: UUID, @Argument height: Double): AboutPage =
        aboutService.updateCanvasHeight(id, height)

    @MutationMapping
    fun updateAboutPageCanvasRounded(@Argument id: UUID, @Argument rounded: Boolean): AboutPage =
        aboutService.updateCanvasRounded(id, rounded)

    @MutationMapping
    fun updateAboutPageBlockRounded(@Argument id: UUID, @Argument rounded: Boolean): AboutPage =
        aboutService.updateBlockRounded(id, rounded)

    @MutationMapping
    fun updateAboutPageCanvasBordered(@Argument id: UUID, @Argument bordered: Boolean): AboutPage =
        aboutService.updateCanvasBordered(id, bordered)

    @MutationMapping
    fun updateAboutPageBlockHighlighted(@Argument id: UUID, @Argument highlighted: Boolean): AboutPage =
        aboutService.updateBlockHighlighted(id, highlighted)

    @MutationMapping
    fun updateAboutPageBlockIcon(@Argument id: UUID, @Argument icon: String?): AboutPage =
        aboutService.updateBlockIcon(id, icon)

    @MutationMapping
    fun updateAboutPageCanvasBackground(
        @Argument id: UUID,
        @Argument mimeType: String,
        @Argument imageBase64: String,
    ): AboutPage = aboutService.updateCanvasBackground(id, mimeType, imageBase64)

    @MutationMapping
    fun removeAboutPageCanvasBackground(@Argument id: UUID): AboutPage = aboutService.removeCanvasBackground(id)

    @MutationMapping
    fun removeAboutPageCanvas(@Argument id: UUID): AboutPage = aboutService.removeCanvas(id)

    @MutationMapping
    fun addAboutPageTextBlock(
        @Argument canvasId: UUID,
        @Argument text: String,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.addTextBlock(canvasId, text, x, y, width, height)

    @MutationMapping
    fun addAboutPagePhotoBlock(
        @Argument canvasId: UUID,
        @Argument mimeType: String,
        @Argument imageBase64: String,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.addPhotoBlock(canvasId, mimeType, imageBase64, x, y, width, height)

    @MutationMapping
    fun addAboutPageButtonBlock(
        @Argument canvasId: UUID,
        @Argument text: String,
        @Argument linkUrl: String,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.addButtonBlock(canvasId, text, linkUrl, x, y, width, height)

    @MutationMapping
    fun addAboutPageGalleryBlock(
        @Argument canvasId: UUID,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
        @Argument slideIntervalSeconds: Double,
    ): AboutPage = aboutService.addGalleryBlock(canvasId, x, y, width, height, slideIntervalSeconds)

    @MutationMapping
    fun addAboutPageGalleryPhoto(
        @Argument blockId: UUID,
        @Argument mimeType: String,
        @Argument imageBase64: String,
    ): AboutPage = aboutService.addGalleryPhoto(blockId, mimeType, imageBase64)

    @MutationMapping
    fun removeAboutPageGalleryPhoto(@Argument blockId: UUID, @Argument imageId: UUID): AboutPage =
        aboutService.removeGalleryPhoto(blockId, imageId)

    @MutationMapping
    fun updateAboutPageGalleryInterval(@Argument id: UUID, @Argument slideIntervalSeconds: Double): AboutPage =
        aboutService.updateGalleryInterval(id, slideIntervalSeconds)

    @MutationMapping
    fun updateAboutPageBlockLayout(
        @Argument id: UUID,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.updateBlockLayout(id, x, y, width, height)

    @MutationMapping
    fun updateAboutPageBlockAlign(@Argument id: UUID, @Argument align: AboutPageBlockAlign): AboutPage =
        aboutService.updateBlockAlign(id, align)

    @MutationMapping
    fun updateAboutPageBlockLayer(@Argument id: UUID, @Argument layer: Int): AboutPage =
        aboutService.updateBlockLayer(id, layer)

    @MutationMapping
    fun updateAboutPageBlockText(@Argument id: UUID, @Argument text: String, @Argument language: AboutPageLanguage): AboutPage =
        aboutService.updateBlockText(id, text, language)

    @MutationMapping
    fun updateAboutPageBlockLink(@Argument id: UUID, @Argument linkUrl: String): AboutPage =
        aboutService.updateBlockLink(id, linkUrl)

    @MutationMapping
    fun removeAboutPageBlock(@Argument id: UUID): AboutPage = aboutService.removeBlock(id)
}
