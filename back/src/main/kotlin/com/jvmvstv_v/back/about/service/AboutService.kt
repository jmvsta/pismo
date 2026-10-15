package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.model.AboutPageMoveDirection
import java.util.UUID

interface AboutService {
    fun aboutPage(): AboutPage
    fun addCanvas(): AboutPage
    fun moveCanvas(id: UUID, direction: AboutPageMoveDirection): AboutPage
    fun updateCanvasHeight(id: UUID, height: Double): AboutPage
    fun updateCanvasRounded(id: UUID, rounded: Boolean): AboutPage
    fun updateBlockRounded(id: UUID, rounded: Boolean): AboutPage
    fun updateCanvasBordered(id: UUID, bordered: Boolean): AboutPage
    fun updateBlockHighlighted(id: UUID, highlighted: Boolean): AboutPage
    fun updateBlockIcon(id: UUID, icon: String?): AboutPage
    fun updateCanvasBackground(id: UUID, mimeType: String, imageBase64: String): AboutPage
    fun removeCanvasBackground(id: UUID): AboutPage
    fun removeCanvas(id: UUID): AboutPage
    fun addTextBlock(canvasId: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addPhotoBlock(
        canvasId: UUID,
        mimeType: String,
        imageBase64: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage
    fun addButtonBlock(
        canvasId: UUID,
        text: String,
        linkUrl: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage
    fun addGalleryBlock(
        canvasId: UUID,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
        slideIntervalSeconds: Double,
    ): AboutPage
    fun addGalleryPhoto(blockId: UUID, mimeType: String, imageBase64: String): AboutPage
    fun removeGalleryPhoto(blockId: UUID, imageId: UUID): AboutPage
    fun updateGalleryInterval(id: UUID, slideIntervalSeconds: Double): AboutPage
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockLayer(id: UUID, layer: Int): AboutPage
    fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage
    fun updateBlockLink(id: UUID, linkUrl: String): AboutPage
    fun removeBlock(id: UUID): AboutPage
}
