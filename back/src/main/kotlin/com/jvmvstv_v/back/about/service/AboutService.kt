package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import java.util.UUID

interface AboutService {
    fun aboutPage(): AboutPage
    fun updateBody(body: String): AboutPage
    fun addTextBlock(text: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun addPhotoBlock(mimeType: String, imageBase64: String, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage
    fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage
    fun updateBlockText(id: UUID, text: String): AboutPage
    fun removeBlock(id: UUID): AboutPage
}
