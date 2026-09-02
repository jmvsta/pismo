package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import java.util.UUID

interface AboutRepository {
    fun find(): AboutPage
    fun updateBody(body: String, updatedBy: UUID): AboutPage
    fun addPhoto(id: UUID, imageId: UUID, caption: String?): AboutPage
    fun removePhoto(id: UUID): UUID?
}
