package com.jvmvstv_v.back.about.model

import java.util.UUID

data class AboutPage(
    val body: String,
    val photos: List<AboutPagePhoto>,
    val updatedAt: String,
)

data class AboutPagePhoto(
    val id: UUID,
    val imageId: UUID,
    val caption: String?,
    val position: Int,
)
