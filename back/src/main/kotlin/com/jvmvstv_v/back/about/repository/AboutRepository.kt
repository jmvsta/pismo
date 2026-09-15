package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import java.util.UUID

interface AboutRepository {
    fun find(): AboutPage
    fun updateBody(body: String, language: AboutPageLanguage, updatedBy: UUID): AboutPage
    fun addCanvas(id: UUID): AboutPage
    fun updateCanvasHeight(id: UUID, height: Double): AboutPage

    /** Sets the canvas's background image, returning the previous one's id (if any) so the caller can delete its blob. */
    fun setCanvasBackground(id: UUID, imageId: UUID?): UUID?

    /** Removes the canvas and its blocks. Returns the image ids of any photo blocks and the background, so the caller can delete their blobs. */
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
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage
    fun updateBlockLink(id: UUID, linkUrl: String): AboutPage

    /** Removes the block. Returns its image id, if any, so the caller can delete its blob. */
    fun removeBlock(id: UUID): UUID?
}
