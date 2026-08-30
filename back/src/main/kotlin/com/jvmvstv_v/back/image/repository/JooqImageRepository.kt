package com.jvmvstv_v.back.image.repository

import com.jvmvstv_v.back.image.model.Image
import com.jvmvstv_v.back.image.model.ImageOwnerType
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JooqImageRepository(private val dsl: DSLContext) : ImageRepository {
    private val IMAGES = DSL.table("images")
    private val ID = DSL.field("id", SQLDataType.UUID)
    private val OWNER_TYPE = DSL.field("owner_type", SQLDataType.VARCHAR)
    private val OWNER_ID = DSL.field("owner_id", SQLDataType.UUID)
    private val MIME_TYPE = DSL.field("mime_type", SQLDataType.VARCHAR)
    private val DATA = DSL.field("data", SQLDataType.VARBINARY)
    private val CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findById(id: UUID): Image? =
        dsl.select(ID, OWNER_TYPE, OWNER_ID, MIME_TYPE, DATA, CREATED_AT)
            .from(IMAGES)
            .where(ID.eq(id))
            .fetchOne { toImage(it) }

    override fun insert(ownerType: ImageOwnerType, ownerId: UUID, mimeType: String, data: ByteArray): Image {
        val id = UUID.randomUUID()
        dsl.insertInto(IMAGES)
            .columns(ID, OWNER_TYPE, OWNER_ID, MIME_TYPE, DATA)
            .values(id, ownerType.name, ownerId, mimeType, data)
            .execute()
        return findById(id) ?: error("Image $id not found after insert")
    }

    override fun deleteById(id: UUID) {
        dsl.deleteFrom(IMAGES).where(ID.eq(id)).execute()
    }

    private fun toImage(record: Record): Image = Image(
        id = record[ID]!!,
        ownerType = ImageOwnerType.valueOf(record[OWNER_TYPE]!!),
        ownerId = record[OWNER_ID]!!,
        mimeType = record[MIME_TYPE]!!,
        data = record[DATA]!!,
        createdAt = record[CREATED_AT]!!.toString(),
    )
}
