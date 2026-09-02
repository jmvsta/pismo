package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import java.util.UUID

interface AboutRepository {
    fun find(): AboutPage
    fun updateBody(body: String, updatedBy: UUID): AboutPage
    fun addTextBlock(id: UUID, text: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addPhotoBlock(id: UUID, imageId: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockText(id: UUID, text: String): AboutPage

    /** Removes the block. Returns its image id, if any, so the caller can delete its blob. */
    fun removeBlock(id: UUID): UUID?
}
