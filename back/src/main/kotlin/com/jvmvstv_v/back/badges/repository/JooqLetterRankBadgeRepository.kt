package com.jvmvstv_v.back.badges.repository

import com.jvmvstv_v.back.badges.model.LetterRankBadge
import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqLetterRankBadgeRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : LetterRankBadgeRepository {
    private val BADGES = DSL.table("letter_rank_badges")
    private val ID = DSL.field("id", SQLDataType.INTEGER)
    private val CODE = DSL.field("code", SQLDataType.VARCHAR)
    private val TITLE = DSL.field("title", SQLDataType.VARCHAR)
    private val MIN_LETTERS = DSL.field("min_letters", SQLDataType.INTEGER)
    private val MAX_LETTERS = DSL.field("max_letters", SQLDataType.INTEGER)
    private val ICON_URL = DSL.field("icon_url", SQLDataType.VARCHAR)
    private val POSITION = DSL.field("position", SQLDataType.INTEGER)

    private val USER_BADGES = DSL.table("user_letter_rank_badges")
    private val UB_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val UB_BADGE_ID = DSL.field("letter_rank_badge_id", SQLDataType.INTEGER)
    private val UB_AWARDED_AT = DSL.field("awarded_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findAll(): List<LetterRankBadge> =
        dsl.select(ID, CODE, TITLE, MIN_LETTERS, MAX_LETTERS, ICON_URL, POSITION)
            .from(BADGES)
            .orderBy(POSITION)
            .fetch { toBadge(it) }

    override fun findForUser(userId: UUID): List<UserLetterRankBadge> =
        dsl.select(UB_BADGE_ID, UB_AWARDED_AT)
            .from(USER_BADGES)
            .where(UB_USER_ID.eq(userId))
            .fetch {
                val badgeId = it[UB_BADGE_ID]!!
                UserLetterRankBadge(
                    user = userRepository.findById(userId) ?: error("User $userId not found"),
                    badge = findById(badgeId) ?: error("Letter rank badge $badgeId not found"),
                    awardedAt = it[UB_AWARDED_AT]!!.toString(),
                )
            }

    override fun findQualifying(letterCount: Int): List<LetterRankBadge> =
        dsl.select(ID, CODE, TITLE, MIN_LETTERS, MAX_LETTERS, ICON_URL, POSITION)
            .from(BADGES)
            .where(MIN_LETTERS.le(letterCount))
            .orderBy(POSITION)
            .fetch { toBadge(it) }

    override fun award(userId: UUID, badgeId: Int) {
        dsl.insertInto(USER_BADGES)
            .columns(UB_USER_ID, UB_BADGE_ID, UB_AWARDED_AT)
            .values(userId, badgeId, OffsetDateTime.now())
            .onConflictDoNothing()
            .execute()
    }

    private fun findById(id: Int): LetterRankBadge? =
        dsl.select(ID, CODE, TITLE, MIN_LETTERS, MAX_LETTERS, ICON_URL, POSITION)
            .from(BADGES)
            .where(ID.eq(id))
            .fetchOne { toBadge(it) }

    private fun toBadge(record: Record): LetterRankBadge = LetterRankBadge(
        id = record[ID]!!,
        code = record[CODE]!!,
        title = record[TITLE]!!,
        minLetters = record[MIN_LETTERS]!!,
        maxLetters = record[MAX_LETTERS],
        iconUrl = record[ICON_URL],
        position = record[POSITION]!!,
    )
}
