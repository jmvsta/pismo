package com.jvmvstv_v.back.about.model

import java.util.UUID

enum class AboutPageBlockType { TEXT, PHOTO, BUTTON }
enum class AboutPageBlockAlign { LEFT, CENTER, RIGHT }

data class AboutPageBlock(
    val id: UUID,
    val type: AboutPageBlockType,
    val text: String?,
    val imageId: UUID?,
    val linkUrl: String?,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double,
    val align: AboutPageBlockAlign,
)

data class AboutPageCanvas(
    val id: UUID,
    val height: Double,
    val backgroundImageId: UUID?,
    val blocks: List<AboutPageBlock>,
)

data class AboutPage(
    val body: String,
    val canvases: List<AboutPageCanvas>,
    val updatedAt: String,
)
