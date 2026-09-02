package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import java.util.UUID

interface AboutService {
    fun aboutPage(): AboutPage
    fun updateBody(body: String): AboutPage
    fun addPhoto(mimeType: String, imageBase64: String, caption: String?): AboutPage
    fun removePhoto(id: UUID): AboutPage
}
