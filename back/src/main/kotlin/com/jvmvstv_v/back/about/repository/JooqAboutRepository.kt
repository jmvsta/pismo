package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlock
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageBlockType
import com.jvmvstv_v.back.about.model.AboutPageCanvas
import com.jvmvstv_v.back.about.model.AboutPageLanguage
import com.jvmvstv_v.back.about.model.AboutPageMoveDirection
import org.jooq.DSLContext
import org.jooq.Field
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

private const val SINGLETON_ID: Short = 1

@Repository
class JooqAboutRepository(private val dsl: DSLContext) : AboutRepository {
    private val PAGE = DSL.table("about_page")
    private val P_ID = DSL.field("id", SQLDataType.SMALLINT)
    private val P_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val CANVASES = DSL.table("about_page_canvases")
    private val C_ID = DSL.field("id", SQLDataType.UUID)
    private val C_HEIGHT = DSL.field("height", SQLDataType.DOUBLE)
    private val C_BACKGROUND_IMAGE_ID = DSL.field("background_image_id", SQLDataType.UUID)
    private val C_POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val C_ROUNDED = DSL.field("rounded", SQLDataType.BOOLEAN)
    private val C_BORDERED = DSL.field("bordered", SQLDataType.BOOLEAN)
    private val C_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val BLOCKS = DSL.table("about_page_blocks")
    private val B_ID = DSL.field("id", SQLDataType.UUID)
    private val B_CANVAS_ID = DSL.field("canvas_id", SQLDataType.UUID)
    private val B_TYPE = DSL.field("block_type", SQLDataType.VARCHAR)
    private val B_TEXT_EN = DSL.field("text_en", SQLDataType.VARCHAR)
    private val B_TEXT_RU = DSL.field("text_ru", SQLDataType.VARCHAR)
    private val B_TEXT_SRB = DSL.field("text_srb", SQLDataType.VARCHAR)
    private val B_IMAGE_ID = DSL.field("image_id", SQLDataType.UUID)
    private val B_LINK_URL = DSL.field("link_url", SQLDataType.VARCHAR)
    private val B_X = DSL.field("x", SQLDataType.DOUBLE)
    private val B_Y = DSL.field("y", SQLDataType.DOUBLE)
    private val B_WIDTH = DSL.field("width", SQLDataType.DOUBLE)
    private val B_HEIGHT = DSL.field("height", SQLDataType.DOUBLE)
    private val B_ALIGN = DSL.field("align", SQLDataType.VARCHAR)
    private val B_Z_INDEX = DSL.field("z_index", SQLDataType.INTEGER)
    private val B_SLIDE_INTERVAL = DSL.field("slide_interval_seconds", SQLDataType.DOUBLE)
    private val B_ROUNDED = DSL.field("rounded", SQLDataType.BOOLEAN)
    private val B_HIGHLIGHTED = DSL.field("highlighted", SQLDataType.BOOLEAN)
    private val B_ICON = DSL.field("icon", SQLDataType.VARCHAR)
    private val B_FONT_SIZE = DSL.field("font_size", SQLDataType.DOUBLE)
    private val B_FONT_FAMILY = DSL.field("font_family", SQLDataType.VARCHAR)
    private val B_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val B_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val GALLERY_PHOTOS = DSL.table("about_page_gallery_photos")
    private val G_ID = DSL.field("id", SQLDataType.UUID)
    private val G_BLOCK_ID = DSL.field("block_id", SQLDataType.UUID)
    private val G_IMAGE_ID = DSL.field("image_id", SQLDataType.UUID)
    private val G_POSITION = DSL.field("position", SQLDataType.INTEGER)

    private fun textColumnFor(language: AboutPageLanguage): Field<String> = when (language) {
        AboutPageLanguage.EN -> B_TEXT_EN
        AboutPageLanguage.RU -> B_TEXT_RU
        AboutPageLanguage.SRB -> B_TEXT_SRB
    }

    override fun find(): AboutPage {
        val updatedAt = dsl.select(P_UPDATED_AT).from(PAGE).where(P_ID.eq(SINGLETON_ID))
            .fetchOne(P_UPDATED_AT) ?: error("about_page singleton row missing")
        return AboutPage(canvases = findCanvases(), updatedAt = updatedAt.toString())
    }

    override fun addCanvas(id: UUID): AboutPage {
        val nextPosition = (dsl.select(DSL.max(C_POSITION)).from(CANVASES).fetchOne(0, Int::class.java) ?: -1) + 1
        dsl.insertInto(CANVASES)
            .columns(C_ID, C_POSITION)
            .values(id, nextPosition)
            .execute()
        return find()
    }

    override fun moveCanvas(id: UUID, direction: AboutPageMoveDirection): AboutPage {
        dsl.transaction { configuration ->
            val tx = DSL.using(configuration)
            val ids = tx.select(C_ID).from(CANVASES).orderBy(C_POSITION, C_ID).fetch(C_ID).filterNotNull().toMutableList()
            val index = ids.indexOf(id)
            val target = if (direction == AboutPageMoveDirection.UP) index - 1 else index + 1
            if (index >= 0 && target in ids.indices) {
                ids[index] = ids[target].also { ids[target] = ids[index] }
            }
            ids.forEachIndexed { position, canvasId ->
                tx.update(CANVASES).set(C_POSITION, position).where(C_ID.eq(canvasId)).execute()
            }
        }
        return find()
    }

    override fun updateCanvasHeight(id: UUID, height: Double): AboutPage {
        dsl.update(CANVASES)
            .set(C_HEIGHT, height)
            .set(C_UPDATED_AT, OffsetDateTime.now())
            .where(C_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateCanvasRounded(id: UUID, rounded: Boolean): AboutPage {
        dsl.update(CANVASES)
            .set(C_ROUNDED, rounded)
            .set(C_UPDATED_AT, OffsetDateTime.now())
            .where(C_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateCanvasBordered(id: UUID, bordered: Boolean): AboutPage {
        dsl.update(CANVASES)
            .set(C_BORDERED, bordered)
            .set(C_UPDATED_AT, OffsetDateTime.now())
            .where(C_ID.eq(id))
            .execute()
        return find()
    }

    override fun setCanvasBackground(id: UUID, imageId: UUID?): UUID? {
        val previousImageId = dsl.select(C_BACKGROUND_IMAGE_ID).from(CANVASES).where(C_ID.eq(id)).fetchOne(C_BACKGROUND_IMAGE_ID)
        dsl.update(CANVASES)
            .set(C_BACKGROUND_IMAGE_ID, imageId)
            .set(C_UPDATED_AT, OffsetDateTime.now())
            .where(C_ID.eq(id))
            .execute()
        return previousImageId
    }

    override fun removeCanvas(id: UUID): List<UUID> {
        val blockImageIds = dsl.select(B_IMAGE_ID).from(BLOCKS)
            .where(B_CANVAS_ID.eq(id)).and(B_IMAGE_ID.isNotNull)
            .fetch(B_IMAGE_ID)
            .filterNotNull()
        val galleryImageIds = dsl.select(G_IMAGE_ID).from(GALLERY_PHOTOS)
            .where(G_BLOCK_ID.`in`(dsl.select(B_ID).from(BLOCKS).where(B_CANVAS_ID.eq(id))))
            .fetch(G_IMAGE_ID)
            .filterNotNull()
        val backgroundImageId = dsl.select(C_BACKGROUND_IMAGE_ID).from(CANVASES).where(C_ID.eq(id)).fetchOne(C_BACKGROUND_IMAGE_ID)
        dsl.deleteFrom(CANVASES).where(C_ID.eq(id)).execute()
        return blockImageIds + galleryImageIds + listOfNotNull(backgroundImageId)
    }

    override fun addTextBlock(
        id: UUID,
        canvasId: UUID,
        text: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage {
        insertBlock(id, canvasId, AboutPageBlockType.TEXT, text, null, null, x, y, width, height)
        return find()
    }

    override fun addPhotoBlock(
        id: UUID,
        canvasId: UUID,
        imageId: UUID,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage {
        insertBlock(id, canvasId, AboutPageBlockType.PHOTO, null, imageId, null, x, y, width, height)
        return find()
    }

    override fun addButtonBlock(
        id: UUID,
        canvasId: UUID,
        text: String,
        linkUrl: String,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ): AboutPage {
        insertBlock(id, canvasId, AboutPageBlockType.BUTTON, text, null, linkUrl, x, y, width, height)
        return find()
    }

    override fun addGalleryBlock(
        id: UUID,
        canvasId: UUID,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
        slideIntervalSeconds: Double,
    ): AboutPage {
        insertBlock(id, canvasId, AboutPageBlockType.GALLERY, null, null, null, x, y, width, height, slideIntervalSeconds)
        return find()
    }

    override fun countGalleryPhotos(blockId: UUID): Int =
        dsl.fetchCount(GALLERY_PHOTOS, G_BLOCK_ID.eq(blockId))

    override fun addGalleryPhoto(blockId: UUID, imageId: UUID): AboutPage {
        val nextPosition = (dsl.select(DSL.max(G_POSITION)).from(GALLERY_PHOTOS).where(G_BLOCK_ID.eq(blockId))
            .fetchOne(0, Int::class.java) ?: -1) + 1
        dsl.insertInto(GALLERY_PHOTOS)
            .columns(G_ID, G_BLOCK_ID, G_IMAGE_ID, G_POSITION)
            .values(UUID.randomUUID(), blockId, imageId, nextPosition)
            .execute()
        return find()
    }

    override fun removeGalleryPhoto(blockId: UUID, imageId: UUID): UUID? {
        val deleted = dsl.deleteFrom(GALLERY_PHOTOS)
            .where(G_BLOCK_ID.eq(blockId)).and(G_IMAGE_ID.eq(imageId))
            .execute()
        return if (deleted > 0) imageId else null
    }

    override fun updateGalleryInterval(id: UUID, slideIntervalSeconds: Double): AboutPage {
        dsl.update(BLOCKS)
            .set(B_SLIDE_INTERVAL, slideIntervalSeconds)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun copyBlock(
        id: UUID,
        canvasId: UUID,
        source: AboutPageBlock,
        x: Double,
        y: Double,
        imageId: UUID?,
        galleryImageIds: List<UUID>,
    ): AboutPage {
        dsl.transaction { configuration ->
            val tx = DSL.using(configuration)
            val nextZIndex = (tx.select(DSL.max(B_Z_INDEX)).from(BLOCKS).where(B_CANVAS_ID.eq(canvasId))
                .fetchOne(0, Int::class.java) ?: 0) + 1
            tx.insertInto(BLOCKS)
                .columns(
                    B_ID, B_CANVAS_ID, B_TYPE, B_TEXT_EN, B_TEXT_RU, B_TEXT_SRB, B_IMAGE_ID, B_LINK_URL, B_X, B_Y,
                    B_WIDTH, B_HEIGHT, B_ALIGN, B_Z_INDEX, B_SLIDE_INTERVAL, B_ROUNDED, B_HIGHLIGHTED, B_ICON,
                    B_FONT_SIZE, B_FONT_FAMILY,
                )
                .values(
                    id, canvasId, source.type.name, source.textEn, source.textRu, source.textSrb, imageId,
                    source.linkUrl, x, y, source.width, source.height, source.align.name, nextZIndex,
                    source.slideIntervalSeconds, source.rounded, source.highlighted, source.icon,
                    source.fontSize, source.fontFamily,
                )
                .execute()
            galleryImageIds.forEachIndexed { position, galleryImageId ->
                tx.insertInto(GALLERY_PHOTOS)
                    .columns(G_ID, G_BLOCK_ID, G_IMAGE_ID, G_POSITION)
                    .values(UUID.randomUUID(), id, galleryImageId, position)
                    .execute()
            }
        }
        return find()
    }

    override fun updateBlockLayout(id: UUID, x: Double, y: Double, width: Double, height: Double): AboutPage {
        dsl.update(BLOCKS)
            .set(B_X, x)
            .set(B_Y, y)
            .set(B_WIDTH, width)
            .set(B_HEIGHT, height)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockAlign(id: UUID, align: AboutPageBlockAlign): AboutPage {
        dsl.update(BLOCKS)
            .set(B_ALIGN, align.name)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockRounded(id: UUID, rounded: Boolean): AboutPage {
        dsl.update(BLOCKS)
            .set(B_ROUNDED, rounded)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockHighlighted(id: UUID, highlighted: Boolean): AboutPage {
        dsl.update(BLOCKS)
            .set(B_HIGHLIGHTED, highlighted)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockFont(id: UUID, fontSize: Double?, fontFamily: String?): AboutPage {
        dsl.update(BLOCKS)
            .set(B_FONT_SIZE, fontSize)
            .set(B_FONT_FAMILY, fontFamily)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockIcon(id: UUID, icon: String?): AboutPage {
        dsl.update(BLOCKS)
            .set(B_ICON, icon)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun findBlockType(id: UUID): AboutPageBlockType? =
        dsl.select(B_TYPE).from(BLOCKS).where(B_ID.eq(id)).fetchOne(B_TYPE)?.let { AboutPageBlockType.valueOf(it) }

    override fun updateBlockLayer(id: UUID, layer: Int): AboutPage {
        dsl.transaction { configuration ->
            val tx = DSL.using(configuration)
            val canvasId = tx.select(B_CANVAS_ID).from(BLOCKS).where(B_ID.eq(id)).fetchOne(B_CANVAS_ID)
            if (canvasId != null) {
                val ids = tx.select(B_ID).from(BLOCKS).where(B_CANVAS_ID.eq(canvasId))
                    .orderBy(B_Z_INDEX, B_CREATED_AT, B_ID)
                    .fetch(B_ID).filterNotNull().toMutableList()
                ids.remove(id)
                ids.add((layer - 1).coerceIn(0, ids.size), id)
                ids.forEachIndexed { index, blockId ->
                    tx.update(BLOCKS).set(B_Z_INDEX, index + 1).where(B_ID.eq(blockId)).execute()
                }
            }
        }
        return find()
    }

    override fun updateBlockText(id: UUID, text: String, language: AboutPageLanguage): AboutPage {
        dsl.update(BLOCKS)
            .set(textColumnFor(language), text)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun updateBlockLink(id: UUID, linkUrl: String): AboutPage {
        dsl.update(BLOCKS)
            .set(B_LINK_URL, linkUrl)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun removeBlock(id: UUID): List<UUID> {
        val imageId = dsl.select(B_IMAGE_ID).from(BLOCKS).where(B_ID.eq(id)).fetchOne(B_IMAGE_ID)
        val galleryImageIds = dsl.select(G_IMAGE_ID).from(GALLERY_PHOTOS).where(G_BLOCK_ID.eq(id))
            .fetch(G_IMAGE_ID)
            .filterNotNull()
        dsl.deleteFrom(BLOCKS).where(B_ID.eq(id)).execute()
        return listOfNotNull(imageId) + galleryImageIds
    }

    private fun insertBlock(
        id: UUID,
        canvasId: UUID,
        type: AboutPageBlockType,
        textEn: String?,
        imageId: UUID?,
        linkUrl: String?,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
        slideIntervalSeconds: Double? = null,
    ) {
        val nextZIndex = (dsl.select(DSL.max(B_Z_INDEX)).from(BLOCKS).where(B_CANVAS_ID.eq(canvasId))
            .fetchOne(0, Int::class.java) ?: 0) + 1
        dsl.insertInto(BLOCKS)
            .columns(
                B_ID, B_CANVAS_ID, B_TYPE, B_TEXT_EN, B_IMAGE_ID, B_LINK_URL, B_X, B_Y, B_WIDTH, B_HEIGHT, B_ALIGN,
                B_Z_INDEX, B_SLIDE_INTERVAL,
            )
            .values(
                id, canvasId, type.name, textEn, imageId, linkUrl, x, y, width, height, AboutPageBlockAlign.LEFT.name,
                nextZIndex, slideIntervalSeconds,
            )
            .execute()
    }

    private fun findCanvases(): List<AboutPageCanvas> {
        val photosByBlock = dsl.select(G_BLOCK_ID, G_IMAGE_ID)
            .from(GALLERY_PHOTOS)
            .orderBy(G_POSITION)
            .fetch()
            .groupBy({ it[G_BLOCK_ID]!! }, { it[G_IMAGE_ID]!! })

        val blockRecordsByCanvas = dsl
            .select(
                B_ID, B_CANVAS_ID, B_TYPE, B_TEXT_EN, B_TEXT_RU, B_TEXT_SRB, B_IMAGE_ID, B_LINK_URL, B_X, B_Y, B_WIDTH,
                B_HEIGHT, B_ALIGN, B_SLIDE_INTERVAL, B_ROUNDED, B_HIGHLIGHTED, B_ICON, B_FONT_SIZE, B_FONT_FAMILY,
            )
            .from(BLOCKS)
            .orderBy(B_Z_INDEX, B_CREATED_AT, B_ID)
            .fetch()
            .groupBy { it[B_CANVAS_ID]!! }

        return dsl.select(C_ID, C_HEIGHT, C_BACKGROUND_IMAGE_ID, C_ROUNDED, C_BORDERED)
            .from(CANVASES)
            .orderBy(C_POSITION, C_ID)
            .fetch {
                val canvasId = it[C_ID]!!
                AboutPageCanvas(
                    id = canvasId,
                    height = it[C_HEIGHT]!!,
                    backgroundImageId = it[C_BACKGROUND_IMAGE_ID],
                    rounded = it[C_ROUNDED]!!,
                    bordered = it[C_BORDERED]!!,
                    blocks = (blockRecordsByCanvas[canvasId] ?: emptyList()).mapIndexed { index, block ->
                        AboutPageBlock(
                            id = block[B_ID]!!,
                            type = AboutPageBlockType.valueOf(block[B_TYPE]!!),
                            textEn = block[B_TEXT_EN],
                            textRu = block[B_TEXT_RU],
                            textSrb = block[B_TEXT_SRB],
                            imageId = block[B_IMAGE_ID],
                            linkUrl = block[B_LINK_URL],
                            galleryImageIds = photosByBlock[block[B_ID]!!] ?: emptyList(),
                            slideIntervalSeconds = block[B_SLIDE_INTERVAL],
                            x = block[B_X]!!,
                            y = block[B_Y]!!,
                            width = block[B_WIDTH]!!,
                            height = block[B_HEIGHT]!!,
                            align = AboutPageBlockAlign.valueOf(block[B_ALIGN]!!),
                            layer = index + 1,
                            rounded = block[B_ROUNDED]!!,
                            highlighted = block[B_HIGHLIGHTED]!!,
                            icon = block[B_ICON],
                            fontSize = block[B_FONT_SIZE],
                            fontFamily = block[B_FONT_FAMILY],
                        )
                    },
                )
            }
    }
}
