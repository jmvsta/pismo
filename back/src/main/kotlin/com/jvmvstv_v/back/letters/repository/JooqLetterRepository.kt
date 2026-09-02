package com.jvmvstv_v.back.letters.repository

import com.jvmvstv_v.back.language.repository.LanguageRepository
import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.LetterStatusEvent
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.questionnaire.repository.QuestionnaireRepository
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqLetterRepository(
    private val dsl: DSLContext,
    private val matchingRepository: MatchingRepository,
    private val userRepository: UserRepository,
    private val languageRepository: LanguageRepository,
    private val questionnaireRepository: QuestionnaireRepository,
) : LetterRepository {
    private val LETTERS = DSL.table("letters")
    private val L_ID = DSL.field("id", SQLDataType.UUID)
    private val L_CONNECTION_ID = DSL.field("connection_id", SQLDataType.UUID)
    private val L_SENDER_ID = DSL.field("sender_id", SQLDataType.UUID)
    private val L_RECIPIENT_ID = DSL.field("recipient_id", SQLDataType.UUID)
    private val L_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val L_TRACKING_CODE = DSL.field("tracking_code", SQLDataType.VARCHAR)
    private val L_NOTE = DSL.field("note", SQLDataType.VARCHAR)
    private val L_LANGUAGE_CODE = DSL.field("language_code", SQLDataType.VARCHAR)
    private val L_SENT_AT = DSL.field("sent_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val L_DELIVERED_AT = DSL.field("delivered_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val L_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val L_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val EVENTS = DSL.table("letter_status_events")
    private val EV_ID = DSL.field("id", SQLDataType.UUID)
    private val EV_LETTER_ID = DSL.field("letter_id", SQLDataType.UUID)
    private val EV_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val EV_LOCATION = DSL.field("location", SQLDataType.VARCHAR)
    private val EV_NOTE = DSL.field("note", SQLDataType.VARCHAR)
    private val EV_OCCURRED_AT = DSL.field("occurred_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val EV_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val FEEDBACK = DSL.table("letter_feedback")
    private val F_ID = DSL.field("id", SQLDataType.UUID)
    private val F_LETTER_ID = DSL.field("letter_id", SQLDataType.UUID)
    private val F_RATER_ID = DSL.field("rater_id", SQLDataType.UUID)
    private val F_LETTER_SCORE = DSL.field("letter_score", SQLDataType.INTEGER)
    private val F_SENDER_SCORE = DSL.field("sender_score", SQLDataType.INTEGER)
    private val F_COMMENT = DSL.field("comment", SQLDataType.VARCHAR)
    private val F_VERSION_ID = DSL.field("questionnaire_version_id", SQLDataType.INTEGER)
    private val F_SURVEY = DSL.field("experience_survey", SQLDataType.JSONB)
    private val F_IS_PUBLISHED = DSL.field("is_published", SQLDataType.BOOLEAN)
    private val F_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val F_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val LETTER_COLUMNS = listOf(L_ID, L_CONNECTION_ID, L_SENDER_ID, L_RECIPIENT_ID, L_STATUS,
        L_TRACKING_CODE, L_NOTE, L_LANGUAGE_CODE, L_SENT_AT, L_DELIVERED_AT, L_CREATED_AT, L_UPDATED_AT)

    override fun findById(id: UUID): Letter? =
        dsl.select(LETTER_COLUMNS).from(LETTERS).where(L_ID.eq(id)).fetchOne { toLetter(it, includeFeedback = true) }

    override fun findForConnection(connectionId: UUID): List<Letter> =
        dsl.select(LETTER_COLUMNS).from(LETTERS).where(L_CONNECTION_ID.eq(connectionId))
            .orderBy(L_CREATED_AT.desc())
            .fetch { toLetter(it, includeFeedback = true) }

    override fun findSentByUser(userId: UUID): List<Letter> =
        dsl.select(LETTER_COLUMNS).from(LETTERS).where(L_SENDER_ID.eq(userId))
            .orderBy(L_CREATED_AT.desc())
            .fetch { toLetter(it, includeFeedback = true) }

    override fun findReceivedByUser(userId: UUID): List<Letter> =
        dsl.select(LETTER_COLUMNS).from(LETTERS).where(L_RECIPIENT_ID.eq(userId))
            .orderBy(L_CREATED_AT.desc())
            .fetch { toLetter(it, includeFeedback = true) }

    override fun countPendingIncoming(recipientId: UUID): Int =
        dsl.selectCount().from(LETTERS)
            .where(L_RECIPIENT_ID.eq(recipientId))
            .and(L_STATUS.`in`(LetterStatus.SENT.name, LetterStatus.IN_TRANSIT.name))
            .fetchOne(0, Int::class.java) ?: 0

    override fun countSentByUser(userId: UUID): Int =
        dsl.selectCount().from(LETTERS)
            .where(L_SENDER_ID.eq(userId))
            .and(L_STATUS.ne(LetterStatus.DRAFT.name))
            .fetchOne(0, Int::class.java) ?: 0

    override fun create(senderId: UUID, input: CreateLetterInput): Letter {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        val trackingCode = generateUniqueTrackingCode()
        dsl.insertInto(LETTERS)
            .columns(L_ID, L_CONNECTION_ID, L_SENDER_ID, L_RECIPIENT_ID, L_STATUS, L_TRACKING_CODE, L_LANGUAGE_CODE,
                L_NOTE, L_CREATED_AT, L_UPDATED_AT)
            .values(id, input.connectionId, senderId, input.recipientId, LetterStatus.DRAFT.name, trackingCode,
                input.languageCode, input.note, now, now)
            .execute()
        return findById(id) ?: error("Letter $id not found")
    }

    private fun generateUniqueTrackingCode(): String {
        repeat(10) {
            val code = (0..999999).random().toString().padStart(6, '0')
            val exists = dsl.fetchExists(dsl.selectOne().from(LETTERS).where(L_TRACKING_CODE.eq(code)))
            if (!exists) return code
        }
        error("Could not generate a unique tracking code")
    }

    override fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter {
        val now = OffsetDateTime.now()
        val step = dsl.update(LETTERS).set(L_STATUS, status.name).set(L_UPDATED_AT, now)
        if (status == LetterStatus.SENT) step.set(L_SENT_AT, now)
        if (status == LetterStatus.DELIVERED) step.set(L_DELIVERED_AT, now)
        step.where(L_ID.eq(id)).execute()
        dsl.insertInto(EVENTS)
            .columns(EV_ID, EV_LETTER_ID, EV_STATUS, EV_LOCATION, EV_NOTE, EV_OCCURRED_AT, EV_CREATED_AT)
            .values(UUID.randomUUID(), id, status.name, location, note, now, now)
            .execute()
        return findById(id) ?: error("Letter $id not found")
    }

    override fun submitFeedback(raterId: UUID, input: SubmitLetterFeedbackInput): LetterFeedback {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        dsl.insertInto(FEEDBACK)
            .columns(F_ID, F_LETTER_ID, F_RATER_ID, F_LETTER_SCORE, F_SENDER_SCORE, F_COMMENT, F_VERSION_ID,
                F_SURVEY, F_CREATED_AT, F_UPDATED_AT)
            .values(id, input.letterId, raterId, input.letterScore, input.senderScore, input.comment,
                input.questionnaireVersionId, org.jooq.JSONB.valueOf(input.experienceSurvey ?: "{}"), now, now)
            .execute()
        return findFeedbackById(id) ?: error("Letter feedback $id not found")
    }

    private fun findFeedbackForLetter(letterId: UUID): LetterFeedback? =
        dsl.select(F_ID, F_RATER_ID, F_LETTER_SCORE, F_SENDER_SCORE, F_COMMENT, F_VERSION_ID, F_SURVEY,
            F_IS_PUBLISHED, F_CREATED_AT, F_UPDATED_AT)
            .from(FEEDBACK)
            .where(F_LETTER_ID.eq(letterId))
            .fetchOne { toFeedback(it, letterId) }

    private fun findFeedbackById(id: UUID): LetterFeedback? =
        dsl.select(F_ID, F_LETTER_ID, F_RATER_ID, F_LETTER_SCORE, F_SENDER_SCORE, F_COMMENT, F_VERSION_ID, F_SURVEY,
            F_IS_PUBLISHED, F_CREATED_AT, F_UPDATED_AT)
            .from(FEEDBACK)
            .where(F_ID.eq(id))
            .fetchOne { toFeedback(it, it[F_LETTER_ID]!!) }

    private fun findStatusEvents(letterId: UUID): List<LetterStatusEvent> =
        dsl.select(EV_ID, EV_STATUS, EV_LOCATION, EV_NOTE, EV_OCCURRED_AT, EV_CREATED_AT)
            .from(EVENTS)
            .where(EV_LETTER_ID.eq(letterId))
            .orderBy(EV_OCCURRED_AT.desc())
            .fetch {
                LetterStatusEvent(
                    id = it[EV_ID]!!,
                    status = LetterStatus.valueOf(it[EV_STATUS]!!),
                    location = it[EV_LOCATION],
                    note = it[EV_NOTE],
                    occurredAt = it[EV_OCCURRED_AT]!!.toString(),
                    createdAt = it[EV_CREATED_AT]!!.toString(),
                )
            }

    private fun toLetter(record: Record, includeFeedback: Boolean): Letter {
        val id = record[L_ID]!!
        return Letter(
            id = id,
            connection = matchingRepository.findConnectionById(record[L_CONNECTION_ID]!!)
                ?: error("Connection not found"),
            sender = userRepository.findById(record[L_SENDER_ID]!!) ?: error("User not found"),
            recipient = userRepository.findById(record[L_RECIPIENT_ID]!!) ?: error("User not found"),
            status = LetterStatus.valueOf(record[L_STATUS]!!),
            trackingCode = record[L_TRACKING_CODE],
            note = record[L_NOTE],
            language = record[L_LANGUAGE_CODE]?.let { languageRepository.findByCode(it) },
            sentAt = record[L_SENT_AT]?.toString(),
            deliveredAt = record[L_DELIVERED_AT]?.toString(),
            createdAt = record[L_CREATED_AT]!!.toString(),
            updatedAt = record[L_UPDATED_AT]!!.toString(),
            statusEvents = findStatusEvents(id),
            feedback = if (includeFeedback) findFeedbackForLetter(id) else null,
        )
    }

    private fun toFeedback(record: Record, letterId: UUID): LetterFeedback {
        val letterRecord = dsl.select(LETTER_COLUMNS).from(LETTERS).where(L_ID.eq(letterId)).fetchOne()
            ?: error("Letter $letterId not found")
        val versionId = record[F_VERSION_ID]
        return LetterFeedback(
            id = record[F_ID]!!,
            letter = toLetter(letterRecord, includeFeedback = false),
            rater = userRepository.findById(record[F_RATER_ID]!!) ?: error("User not found"),
            letterScore = record[F_LETTER_SCORE]!!,
            senderScore = record[F_SENDER_SCORE],
            comment = record[F_COMMENT],
            questionnaireVersion = versionId?.let { questionnaireRepository.findVersionById(it) },
            experienceSurvey = record[F_SURVEY]!!.data(),
            isPublished = record[F_IS_PUBLISHED]!!,
            createdAt = record[F_CREATED_AT]!!.toString(),
            updatedAt = record[F_UPDATED_AT]!!.toString(),
        )
    }
}
