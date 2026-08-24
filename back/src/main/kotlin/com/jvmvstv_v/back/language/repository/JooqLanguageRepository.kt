package com.jvmvstv_v.back.language.repository

import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.language.model.LanguageProficiency
import com.jvmvstv_v.back.language.model.LanguagePurpose
import com.jvmvstv_v.back.language.model.UserLanguage
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqLanguageRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : LanguageRepository {
    private val LANGUAGES = DSL.table("languages")
    private val CODE = DSL.field("code", SQLDataType.VARCHAR)
    private val NAME = DSL.field("name", SQLDataType.VARCHAR)
    private val NATIVE_NAME = DSL.field("native_name", SQLDataType.VARCHAR)
    private val POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val ACTIVE = DSL.field("active", SQLDataType.BOOLEAN)

    private val USER_LANGUAGES = DSL.table("user_languages")
    private val UL_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val UL_LANGUAGE_CODE = DSL.field("language_code", SQLDataType.VARCHAR)
    private val UL_PURPOSE = DSL.field("purpose", SQLDataType.VARCHAR)
    private val UL_PROFICIENCY = DSL.field("proficiency", SQLDataType.VARCHAR)
    private val UL_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findAll(activeOnly: Boolean?): List<Language> {
        val step = dsl.select(CODE, NAME, NATIVE_NAME, POSITION, ACTIVE).from(LANGUAGES)
        val query = if (activeOnly == true) step.where(ACTIVE.isTrue) else step
        return query.orderBy(POSITION).fetch { toLanguage(it) }
    }

    override fun findByCode(code: String): Language? =
        dsl.select(CODE, NAME, NATIVE_NAME, POSITION, ACTIVE)
            .from(LANGUAGES)
            .where(CODE.eq(code))
            .fetchOne { toLanguage(it) }

    override fun findForUser(userId: UUID): List<UserLanguage> =
        dsl.select(UL_LANGUAGE_CODE, UL_PURPOSE, UL_PROFICIENCY, UL_CREATED_AT)
            .from(USER_LANGUAGES)
            .where(UL_USER_ID.eq(userId))
            .fetch { toUserLanguage(userId, it) }

    override fun setUserLanguage(
        userId: UUID,
        languageCode: String,
        purpose: LanguagePurpose,
        proficiency: LanguageProficiency?,
    ): UserLanguage {
        dsl.insertInto(USER_LANGUAGES)
            .columns(UL_USER_ID, UL_LANGUAGE_CODE, UL_PURPOSE, UL_PROFICIENCY, UL_CREATED_AT)
            .values(userId, languageCode, purpose.name, proficiency?.name, OffsetDateTime.now())
            .onConflict(UL_USER_ID, UL_LANGUAGE_CODE, UL_PURPOSE)
            .doUpdate()
            .set(UL_PROFICIENCY, proficiency?.name)
            .execute()
        return findForUser(userId).first { it.language.code == languageCode && it.purpose == purpose }
    }

    override fun removeUserLanguage(userId: UUID, languageCode: String, purpose: LanguagePurpose): Boolean =
        dsl.deleteFrom(USER_LANGUAGES)
            .where(UL_USER_ID.eq(userId))
            .and(UL_LANGUAGE_CODE.eq(languageCode))
            .and(UL_PURPOSE.eq(purpose.name))
            .execute() > 0

    private fun toLanguage(record: Record): Language = Language(
        code = record[CODE]!!,
        name = record[NAME]!!,
        nativeName = record[NATIVE_NAME]!!,
        position = record[POSITION]!!,
        active = record[ACTIVE]!!,
    )

    private fun toUserLanguage(userId: UUID, record: Record): UserLanguage {
        val languageCode = record[UL_LANGUAGE_CODE]!!
        val language = dsl.select(CODE, NAME, NATIVE_NAME, POSITION, ACTIVE)
            .from(LANGUAGES)
            .where(CODE.eq(languageCode))
            .fetchOne { toLanguage(it) } ?: error("Language $languageCode not found")
        return UserLanguage(
            user = userRepository.findById(userId) ?: error("User $userId not found"),
            language = language,
            purpose = LanguagePurpose.valueOf(record[UL_PURPOSE]!!),
            proficiency = record[UL_PROFICIENCY]?.let { LanguageProficiency.valueOf(it) },
            createdAt = record[UL_CREATED_AT]!!.toString(),
        )
    }
}
