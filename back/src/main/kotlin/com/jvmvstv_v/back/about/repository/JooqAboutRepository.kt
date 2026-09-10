package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlock
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
import com.jvmvstv_v.back.about.model.AboutPageBlockType
import com.jvmvstv_v.back.about.model.AboutPageCanvas
import org.jooq.DSLContext
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
    private val P_BODY = DSL.field("body", SQLDataType.VARCHAR)
    private val P_UPDATED_BY = DSL.field("updated_by", SQLDataType.UUID)
    private val P_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val CANVASES = DSL.table("about_page_canvases")
    private val C_ID = DSL.field("id", SQLDataType.UUID)
    private val C_HEIGHT = DSL.field("height", SQLDataType.DOUBLE)
    private val C_POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val C_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val BLOCKS = DSL.table("about_page_blocks")
    private val B_ID = DSL.field("id", SQLDataType.UUID)
    private val B_CANVAS_ID = DSL.field("canvas_id", SQLDataType.UUID)
    private val B_TYPE = DSL.field("block_type", SQLDataType.VARCHAR)
    private val B_TEXT = DSL.field("text", SQLDataType.VARCHAR)
    private val B_IMAGE_ID = DSL.field("image_id", SQLDataType.UUID)
    private val B_X = DSL.field("x", SQLDataType.DOUBLE)
    private val B_Y = DSL.field("y", SQLDataType.DOUBLE)
    private val B_WIDTH = DSL.field("width", SQLDataType.DOUBLE)
    private val B_HEIGHT = DSL.field("height", SQLDataType.DOUBLE)
    private val B_ALIGN = DSL.field("align", SQLDataType.VARCHAR)
    private val B_Z_INDEX = DSL.field("z_index", SQLDataType.INTEGER)
    private val B_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun find(): AboutPage {
        val record = dsl.select(P_BODY, P_UPDATED_AT).from(PAGE).where(P_ID.eq(SINGLETON_ID))
            .fetchOne() ?: error("about_page singleton row missing")
        return AboutPage(
            body = record[P_BODY]!!,
            canvases = findCanvases(),
            updatedAt = record[P_UPDATED_AT]!!.toString(),
        )
    }

    override fun updateBody(body: String, updatedBy: UUID): AboutPage {
        dsl.update(PAGE)
            .set(P_BODY, body)
            .set(P_UPDATED_BY, updatedBy)
            .set(P_UPDATED_AT, OffsetDateTime.now())
            .where(P_ID.eq(SINGLETON_ID))
            .execute()
        return find()
    }

    override fun addCanvas(id: UUID): AboutPage {
        val nextPosition = (dsl.select(DSL.max(C_POSITION)).from(CANVASES).fetchOne(0, Int::class.java) ?: -1) + 1
        dsl.insertInto(CANVASES)
            .columns(C_ID, C_POSITION)
            .values(id, nextPosition)
            .execute()
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

    override fun removeCanvas(id: UUID): List<UUID> {
        val imageIds = dsl.select(B_IMAGE_ID).from(BLOCKS)
            .where(B_CANVAS_ID.eq(id)).and(B_IMAGE_ID.isNotNull)
            .fetch(B_IMAGE_ID)
            .filterNotNull()
        dsl.deleteFrom(CANVASES).where(C_ID.eq(id)).execute()
        return imageIds
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
        insertBlock(id, canvasId, AboutPageBlockType.TEXT, text, null, x, y, width, height)
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
        insertBlock(id, canvasId, AboutPageBlockType.PHOTO, null, imageId, x, y, width, height)
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

    override fun updateBlockText(id: UUID, text: String): AboutPage {
        dsl.update(BLOCKS)
            .set(B_TEXT, text)
            .set(B_UPDATED_AT, OffsetDateTime.now())
            .where(B_ID.eq(id))
            .execute()
        return find()
    }

    override fun removeBlock(id: UUID): UUID? {
        val imageId = dsl.select(B_IMAGE_ID).from(BLOCKS).where(B_ID.eq(id)).fetchOne(B_IMAGE_ID)
        dsl.deleteFrom(BLOCKS).where(B_ID.eq(id)).execute()
        return imageId
    }

    private fun insertBlock(
        id: UUID,
        canvasId: UUID,
        type: AboutPageBlockType,
        text: String?,
        imageId: UUID?,
        x: Double,
        y: Double,
        width: Double,
        height: Double,
    ) {
        val nextZIndex = (dsl.select(DSL.max(B_Z_INDEX)).from(BLOCKS).where(B_CANVAS_ID.eq(canvasId))
            .fetchOne(0, Int::class.java) ?: -1) + 1
        dsl.insertInto(BLOCKS)
            .columns(B_ID, B_CANVAS_ID, B_TYPE, B_TEXT, B_IMAGE_ID, B_X, B_Y, B_WIDTH, B_HEIGHT, B_ALIGN, B_Z_INDEX)
            .values(id, canvasId, type.name, text, imageId, x, y, width, height, AboutPageBlockAlign.LEFT.name, nextZIndex)
            .execute()
    }

    private fun findCanvases(): List<AboutPageCanvas> {
        val blocksByCanvas = dsl
            .select(B_ID, B_CANVAS_ID, B_TYPE, B_TEXT, B_IMAGE_ID, B_X, B_Y, B_WIDTH, B_HEIGHT, B_ALIGN, B_Z_INDEX)
            .from(BLOCKS)
            .orderBy(B_Z_INDEX)
            .fetch {
                AboutPageBlock(
                    id = it[B_ID]!!,
                    type = AboutPageBlockType.valueOf(it[B_TYPE]!!),
                    text = it[B_TEXT],
                    imageId = it[B_IMAGE_ID],
                    x = it[B_X]!!,
                    y = it[B_Y]!!,
                    width = it[B_WIDTH]!!,
                    height = it[B_HEIGHT]!!,
                    align = AboutPageBlockAlign.valueOf(it[B_ALIGN]!!),
                ) to it[B_CANVAS_ID]!!
            }
            .groupBy({ it.second }, { it.first })

        return dsl.select(C_ID, C_HEIGHT)
            .from(CANVASES)
            .orderBy(C_POSITION)
            .fetch {
                val canvasId = it[C_ID]!!
                AboutPageCanvas(
                    id = canvasId,
                    height = it[C_HEIGHT]!!,
                    blocks = blocksByCanvas[canvasId] ?: emptyList(),
                )
            }
    }
}
