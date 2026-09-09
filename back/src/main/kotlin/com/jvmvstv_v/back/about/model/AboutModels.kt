package com.jvmvstv_v.back.about.model

import java.util.UUID

enum class AboutPageBlockType { TEXT, PHOTO }
enum class AboutPageBlockAlign { LEFT, CENTER, RIGHT }

data class AboutPageBlock(
    val id: UUID,
    val type: AboutPageBlockType,
    val text: String?,
    val imageId: UUID?,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double,
    val align: AboutPageBlockAlign,
)

data class AboutPage(
    val body: String,
    val blocks: List<AboutPageBlock>,
    val updatedAt: String,
)
