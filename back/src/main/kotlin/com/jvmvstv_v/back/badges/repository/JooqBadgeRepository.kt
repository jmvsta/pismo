package com.jvmvstv_v.back.badges.repository

import com.jvmvstv_v.back.badges.model.Badge
import com.jvmvstv_v.back.badges.model.UserBadge
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JooqBadgeRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : BadgeRepository {
    private val BADGES = DSL.table("badges")
    private val ID = DSL.field("id", SQLDataType.INTEGER)
    private val CODE = DSL.field("code", SQLDataType.VARCHAR)
    private val TITLE = DSL.field("title", SQLDataType.VARCHAR)
    private val DESCRIPTION = DSL.field("description", SQLDataType.VARCHAR)
    private val ICON_URL = DSL.field("icon_url", SQLDataType.VARCHAR)
    private val POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val ACTIVE = DSL.field("active", SQLDataType.BOOLEAN)

    private val USER_BADGES = DSL.table("user_badges")
    private val UB_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val UB_BADGE_ID = DSL.field("badge_id", SQLDataType.INTEGER)
    private val UB_AWARDED_AT = DSL.field("awarded_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findAll(): List<Badge> =
        dsl.select(ID, CODE, TITLE, DESCRIPTION, ICON_URL, POSITION, ACTIVE)
            .from(BADGES)
            .orderBy(POSITION)
            .fetch { toBadge(it) }

    override fun findForUser(userId: UUID): List<UserBadge> =
        dsl.select(UB_BADGE_ID, UB_AWARDED_AT)
            .from(USER_BADGES)
            .where(UB_USER_ID.eq(userId))
            .fetch {
                val badgeId = it[UB_BADGE_ID]!!
                UserBadge(
                    user = userRepository.findById(userId) ?: error("User $userId not found"),
                    badge = findById(badgeId) ?: error("Badge $badgeId not found"),
                    awardedAt = it[UB_AWARDED_AT]!!.toString(),
                )
            }

    private fun findById(id: Int): Badge? =
        dsl.select(ID, CODE, TITLE, DESCRIPTION, ICON_URL, POSITION, ACTIVE)
            .from(BADGES)
            .where(ID.eq(id))
            .fetchOne { toBadge(it) }

    private fun toBadge(record: Record): Badge = Badge(
        id = record[ID]!!,
        code = record[CODE]!!,
        title = record[TITLE]!!,
        description = record[DESCRIPTION],
        iconUrl = record[ICON_URL],
        position = record[POSITION]!!,
        active = record[ACTIVE]!!,
    )
}
