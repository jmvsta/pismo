package com.jvmvstv_v.back.about.repository

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPagePhoto
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

    private val PHOTOS = DSL.table("about_page_photos")
    private val PH_ID = DSL.field("id", SQLDataType.UUID)
    private val PH_IMAGE_ID = DSL.field("image_id", SQLDataType.UUID)
    private val PH_CAPTION = DSL.field("caption", SQLDataType.VARCHAR)
    private val PH_POSITION = DSL.field("position", SQLDataType.INTEGER)

    override fun find(): AboutPage {
        val record = dsl.select(P_BODY, P_UPDATED_AT).from(PAGE).where(P_ID.eq(SINGLETON_ID))
            .fetchOne() ?: error("about_page singleton row missing")
        return AboutPage(
            body = record[P_BODY]!!,
            photos = findPhotos(),
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

    override fun addPhoto(id: UUID, imageId: UUID, caption: String?): AboutPage {
        val nextPosition = (dsl.select(DSL.max(PH_POSITION)).from(PHOTOS).fetchOne(0, Int::class.java) ?: -1) + 1
        dsl.insertInto(PHOTOS)
            .columns(PH_ID, PH_IMAGE_ID, PH_CAPTION, PH_POSITION)
            .values(id, imageId, caption, nextPosition)
            .execute()
        return find()
    }

    override fun removePhoto(id: UUID): UUID? {
        val imageId = dsl.select(PH_IMAGE_ID).from(PHOTOS).where(PH_ID.eq(id)).fetchOne(PH_IMAGE_ID)
        dsl.deleteFrom(PHOTOS).where(PH_ID.eq(id)).execute()
        return imageId
    }

    private fun findPhotos(): List<AboutPagePhoto> =
        dsl.select(PH_ID, PH_IMAGE_ID, PH_CAPTION, PH_POSITION)
            .from(PHOTOS)
            .orderBy(PH_POSITION)
            .fetch {
                AboutPagePhoto(
                    id = it[PH_ID]!!,
                    imageId = it[PH_IMAGE_ID]!!,
                    caption = it[PH_CAPTION],
                    position = it[PH_POSITION]!!,
                )
            }
}
