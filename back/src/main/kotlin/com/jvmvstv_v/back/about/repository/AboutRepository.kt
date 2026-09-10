package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import java.util.UUID

interface AboutRepository {
    fun find(): AboutPage
    fun updateBody(body: String, updatedBy: UUID): AboutPage
    fun addCanvas(id: UUID): AboutPage
    fun updateCanvasHeight(id: UUID, height: Double): AboutPage

    /** Removes the canvas and its blocks. Returns the image ids of any photo blocks, so the caller can delete their blobs. */
    fun removeCanvas(id: UUID): List<UUID>

    fun addTextBlock(id: UUID, canvasId: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addPhotoBlock(id: UUID, canvasId: UUID, imageId: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockText(id: UUID, text: String): AboutPage

    /** Removes the block. Returns its image id, if any, so the caller can delete its blob. */
    fun removeBlock(id: UUID): UUID?
}
