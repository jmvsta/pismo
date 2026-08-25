package com.jvmvstv_v.back.questionnaire.repository

import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.JSONB
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqQuestionnaireRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : QuestionnaireRepository {
    private val VERSIONS = DSL.table("questionnaire_versions")
    private val V_ID = DSL.field("id", SQLDataType.INTEGER)
    private val V_KIND = DSL.field("kind", SQLDataType.VARCHAR)
    private val V_VERSION = DSL.field("version", SQLDataType.INTEGER)
    private val V_DEFINITION = DSL.field("definition", SQLDataType.JSONB)
    private val V_IS_ACTIVE = DSL.field("is_active", SQLDataType.BOOLEAN)
    private val V_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val RESPONSES = DSL.table("user_questionnaire_responses")
    private val RE_ID = DSL.field("id", SQLDataType.UUID)
    private val RE_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val RE_VERSION_ID = DSL.field("questionnaire_version_id", SQLDataType.INTEGER)
    private val RE_ANSWERS = DSL.field("answers", SQLDataType.JSONB)
    private val RE_SUBMITTED_AT = DSL.field("submitted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val RE_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val RE_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findActiveVersion(kind: QuestionnaireKind): QuestionnaireVersion? =
        dsl.select(V_ID, V_KIND, V_VERSION, V_DEFINITION, V_IS_ACTIVE, V_CREATED_AT)
            .from(VERSIONS)
            .where(V_KIND.eq(kind.name.lowercase())).and(V_IS_ACTIVE.isTrue)
            .fetchOne { toVersion(it) }

    override fun findVersionById(id: Int): QuestionnaireVersion? =
        dsl.select(V_ID, V_KIND, V_VERSION, V_DEFINITION, V_IS_ACTIVE, V_CREATED_AT)
            .from(VERSIONS)
            .where(V_ID.eq(id))
            .fetchOne { toVersion(it) }

    override fun findAllVersions(kind: QuestionnaireKind): List<QuestionnaireVersion> =
        dsl.select(V_ID, V_KIND, V_VERSION, V_DEFINITION, V_IS_ACTIVE, V_CREATED_AT)
            .from(VERSIONS)
            .where(V_KIND.eq(kind.name.lowercase()))
            .orderBy(V_VERSION.desc())
            .fetch { toVersion(it) }

    override fun findResponse(userId: UUID, questionnaireVersionId: Int): UserQuestionnaireResponse? =
        dsl.select(RE_ID, RE_USER_ID, RE_VERSION_ID, RE_ANSWERS, RE_SUBMITTED_AT, RE_CREATED_AT, RE_UPDATED_AT)
            .from(RESPONSES)
            .where(RE_USER_ID.eq(userId)).and(RE_VERSION_ID.eq(questionnaireVersionId))
            .fetchOne { toResponse(it) }

    override fun saveResponse(userId: UUID, input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse {
        val now = OffsetDateTime.now()
        dsl.insertInto(RESPONSES)
            .columns(RE_USER_ID, RE_VERSION_ID, RE_ANSWERS, RE_CREATED_AT, RE_UPDATED_AT)
            .values(userId, input.questionnaireVersionId, JSONB.valueOf(input.answers), now, now)
            .onConflict(RE_USER_ID, RE_VERSION_ID)
            .doUpdate()
            .set(RE_ANSWERS, JSONB.valueOf(input.answers))
            .set(RE_UPDATED_AT, now)
            .execute()
        return findResponse(userId, input.questionnaireVersionId) ?: error("Questionnaire response not found")
    }

    override fun saveTemplate(kind: QuestionnaireKind, definition: String): QuestionnaireVersion =
        dsl.transactionResult { config ->
            val tx = config.dsl()
            val kindValue = kind.name.lowercase()
            val nextVersion = (tx.select(DSL.max(V_VERSION)).from(VERSIONS).where(V_KIND.eq(kindValue)).fetchOne(0, Int::class.java) ?: 0) + 1
            tx.update(VERSIONS).set(V_IS_ACTIVE, false).where(V_KIND.eq(kindValue)).and(V_IS_ACTIVE.isTrue).execute()
            val id = tx.insertInto(VERSIONS)
                .columns(V_KIND, V_VERSION, V_DEFINITION, V_IS_ACTIVE)
                .values(kindValue, nextVersion, JSONB.valueOf(definition), true)
                .returning(V_ID)
                .fetchOne(V_ID)!!
            tx.select(V_ID, V_KIND, V_VERSION, V_DEFINITION, V_IS_ACTIVE, V_CREATED_AT)
                .from(VERSIONS)
                .where(V_ID.eq(id))
                .fetchOne { toVersion(it) }!!
        }

    override fun submitResponse(id: UUID): UserQuestionnaireResponse {
        dsl.update(RESPONSES)
            .set(RE_SUBMITTED_AT, OffsetDateTime.now())
            .where(RE_ID.eq(id))
            .execute()
        return findResponseById(id) ?: error("Questionnaire response $id not found")
    }

    private fun findResponseById(id: UUID): UserQuestionnaireResponse? =
        dsl.select(RE_ID, RE_USER_ID, RE_VERSION_ID, RE_ANSWERS, RE_SUBMITTED_AT, RE_CREATED_AT, RE_UPDATED_AT)
            .from(RESPONSES)
            .where(RE_ID.eq(id))
            .fetchOne { toResponse(it) }

    private fun toVersion(record: Record): QuestionnaireVersion = QuestionnaireVersion(
        id = record[V_ID]!!,
        kind = QuestionnaireKind.valueOf(record[V_KIND]!!.uppercase()),
        version = record[V_VERSION]!!,
        definition = record[V_DEFINITION]!!.data(),
        isActive = record[V_IS_ACTIVE]!!,
        createdAt = record[V_CREATED_AT]!!.toString(),
    )

    private fun toResponse(record: Record): UserQuestionnaireResponse {
        val versionId = record[RE_VERSION_ID]!!
        return UserQuestionnaireResponse(
            id = record[RE_ID]!!,
            user = userRepository.findById(record[RE_USER_ID]!!) ?: error("User not found"),
            questionnaireVersion = findVersionById(versionId) ?: error("Questionnaire version $versionId not found"),
            answers = record[RE_ANSWERS]!!.data(),
            submittedAt = record[RE_SUBMITTED_AT]?.toString(),
            createdAt = record[RE_CREATED_AT]!!.toString(),
            updatedAt = record[RE_UPDATED_AT]!!.toString(),
        )
    }
}
