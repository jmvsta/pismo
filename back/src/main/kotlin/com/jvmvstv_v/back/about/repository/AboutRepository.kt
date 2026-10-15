package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageBlockType
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.model.AboutPageMoveDirection
import java.util.UUID

interface AboutRepository {
    fun find(): AboutPage
    fun addCanvas(id: UUID): AboutPage

    /** Swaps the canvas with its neighbour in the given direction; a no-op at either end. */
    fun moveCanvas(id: UUID, direction: AboutPageMoveDirection): AboutPage
    fun updateCanvasHeight(id: UUID, height: Double): AboutPage
    fun updateCanvasRounded(id: UUID, rounded: Boolean): AboutPage
    fun updateCanvasBordered(id: UUID, bordered: Boolean): AboutPage

    /** Sets the canvas's background image, returning the previous one's id (if any) so the caller can delete its blob. */
    fun setCanvasBackground(id: UUID, imageId: UUID?): UUID?

    /** Removes the canvas and its blocks. Returns the image ids of any photo/gallery blocks and the background, so the caller can delete their blobs. */
    fun removeCanvas(id: UUID): List<UUID>

    fun addTextBlock(id: UUID, canvasId: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addPhotoBlock(id: UUID, canvasId: UUID, imageId: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addButtonBlock(
        id: UUID,
        canvasId: UUID,
        text: String,
        linkUrl: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage
    fun addGalleryBlock(
        id: UUID,
        canvasId: UUID,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
        slideIntervalSeconds: Double,
    ): AboutPage
    fun countGalleryPhotos(blockId: UUID): Int
    fun addGalleryPhoto(blockId: UUID, imageId: UUID): AboutPage

    /** Removes the photo from the gallery. Returns its image id if it was in it, so the caller can delete its blob. */
    fun removeGalleryPhoto(blockId: UUID, imageId: UUID): UUID?
    fun updateGalleryInterval(id: UUID, slideIntervalSeconds: Double): AboutPage
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockRounded(id: UUID, rounded: Boolean): AboutPage
    fun updateBlockHighlighted(id: UUID, highlighted: Boolean): AboutPage

    /** Sets the block's icon name, or clears it when null. */
    fun updateBlockIcon(id: UUID, icon: String?): AboutPage
    fun findBlockType(id: UUID): AboutPageBlockType?

    /** Moves the block to the given 1-based layer within its canvas (1 = backmost), shifting the others. */
    fun updateBlockLayer(id: UUID, layer: Int): AboutPage
    fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage
    fun updateBlockLink(id: UUID, linkUrl: String): AboutPage

    /** Removes the block. Returns the image ids of its photo (or its gallery's photos), so the caller can delete their blobs. */
    fun removeBlock(id: UUID): List<UUID>
}
