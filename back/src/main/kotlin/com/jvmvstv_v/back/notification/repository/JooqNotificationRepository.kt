package com.jvmvstv_v.back.notification.repository

import com.jvmvstv_v.back.notification.model.Notification
import com.jvmvstv_v.back.notification.model.NotificationType
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqNotificationRepository(private val dsl: DSLContext) : NotificationRepository {
    private val NOTIFICATIONS = DSL.table("notifications")
    private val ID = DSL.field("id", SQLDataType.UUID)
    private val USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val TYPE = DSL.field("type", SQLDataType.VARCHAR)
    private val TITLE = DSL.field("title", SQLDataType.VARCHAR)
    private val BODY = DSL.field("body", SQLDataType.VARCHAR)
    private val READ_AT = DSL.field("read_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun insert(userId: UUID, type: NotificationType, title: String, body: String?): Notification {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        dsl.insertInto(NOTIFICATIONS)
            .columns(ID, USER_ID, TYPE, TITLE, BODY, CREATED_AT)
            .values(id, userId, type.name, title, body, now)
            .execute()
        return findById(id) ?: error("Notification $id not found")
    }

    override fun findForUser(userId: UUID, unreadOnly: Boolean): List<Notification> {
        val step = dsl.select(ID, TYPE, TITLE, BODY, READ_AT, CREATED_AT)
            .from(NOTIFICATIONS)
            .where(USER_ID.eq(userId))
        val filtered = if (unreadOnly) step.and(READ_AT.isNull) else step
        return filtered.orderBy(CREATED_AT.desc()).fetch { toNotification(it) }
    }

    override fun markRead(id: UUID, userId: UUID): Notification {
        dsl.update(NOTIFICATIONS)
            .set(READ_AT, OffsetDateTime.now())
            .where(ID.eq(id)).and(USER_ID.eq(userId)).and(READ_AT.isNull)
            .execute()
        return findById(id) ?: error("Notification $id not found")
    }

    override fun countUnread(userId: UUID): Int =
        dsl.selectCount().from(NOTIFICATIONS)
            .where(USER_ID.eq(userId)).and(READ_AT.isNull)
            .fetchOne(0, Int::class.java) ?: 0

    private fun findById(id: UUID): Notification? =
        dsl.select(ID, TYPE, TITLE, BODY, READ_AT, CREATED_AT)
            .from(NOTIFICATIONS)
            .where(ID.eq(id))
            .fetchOne { toNotification(it) }

    private fun toNotification(record: Record): Notification = Notification(
        id = record[ID]!!,
        type = NotificationType.valueOf(record[TYPE]!!),
        title = record[TITLE]!!,
        body = record[BODY],
        readAt = record[READ_AT]?.toString(),
        createdAt = record[CREATED_AT]!!.toString(),
    )
}
