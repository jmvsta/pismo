package com.jvmvstv_v.back.about.model

import java.util.UUID

enum class AboutPageBlockType { TEXT, PHOTO, BUTTON, GALLERY }
enum class AboutPageBlockAlign { LEFT, CENTER, RIGHT }
enum class AboutPageLanguage { EN, RU, SRB }
enum class AboutPageMoveDirection { UP, DOWN }

data class AboutPageBlock(
    val id: UUID,
    val type: AboutPageBlockType,
    val textEn: String?,
    val textRu: String?,
    val textSrb: String?,
    val imageId: UUID?,
    val linkUrl: String?,
    val galleryImageIds: List<UUID>,
    val slideIntervalSeconds: Double?,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double,
    val align: AboutPageBlockAlign,
    val layer: Int,
    val rounded: Boolean,
)

data class AboutPageCanvas(
    val id: UUID,
    val height: Double,
    val backgroundImageId: UUID?,
    val rounded: Boolean,
    val blocks: List<AboutPageBlock>,
)

data class AboutPage(
    val canvases: List<AboutPageCanvas>,
    val updatedAt: String,
)
