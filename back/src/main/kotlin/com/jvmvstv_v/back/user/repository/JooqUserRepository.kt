package com.jvmvstv_v.back.user.repository

import com.jvmvstv_v.back.user.model.OauthProvider
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserOauthAccount
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.model.UserStatus
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqUserRepository(private val dsl: DSLContext) : UserRepository {
    private val USERS = DSL.table("users")
    private val ID = DSL.field("id", SQLDataType.UUID)
    private val NICKNAME = DSL.field("nickname", SQLDataType.VARCHAR)
    private val EMAIL = DSL.field("email", SQLDataType.VARCHAR)
    private val DATE_OF_BIRTH = DSL.field("date_of_birth", SQLDataType.LOCALDATE)
    private val AVATAR_URL = DSL.field("avatar_url", SQLDataType.VARCHAR)
    private val BIO = DSL.field("bio", SQLDataType.VARCHAR)
    private val CITY = DSL.field("city", SQLDataType.VARCHAR)
    private val COUNTRY_CODE = DSL.field("country_code", SQLDataType.VARCHAR)
    private val ROLE = DSL.field("role", SQLDataType.VARCHAR)
    private val STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val RULES_ACCEPTED_AT = DSL.field("rules_accepted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val EMAIL_VERIFIED_AT = DSL.field("email_verified_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val LAST_SEEN_AT = DSL.field("last_seen_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val DELETED_AT = DSL.field("deleted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val OAUTH_ACCOUNTS = DSL.table("user_oauth_accounts")
    private val OAUTH_ID = DSL.field("id", SQLDataType.UUID)
    private val OAUTH_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val OAUTH_PROVIDER = DSL.field("provider", SQLDataType.VARCHAR)
    private val OAUTH_PROVIDER_USER_ID = DSL.field("provider_user_id", SQLDataType.VARCHAR)
    private val OAUTH_EMAIL = DSL.field("email", SQLDataType.VARCHAR)
    private val OAUTH_LINKED_AT = DSL.field("linked_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findById(id: UUID): User? =
        dsl.select(ID, NICKNAME, EMAIL, DATE_OF_BIRTH, AVATAR_URL, BIO, CITY, COUNTRY_CODE, ROLE, STATUS,
            RULES_ACCEPTED_AT, EMAIL_VERIFIED_AT, LAST_SEEN_AT, CREATED_AT, UPDATED_AT)
            .from(USERS)
            .where(ID.eq(id)).and(DELETED_AT.isNull)
            .fetchOne { toUser(it) }

    override fun update(id: UUID, input: UpdateProfileInput): User {
        val step = dsl.update(USERS).set(UPDATED_AT, OffsetDateTime.now())
        input.nickname?.let { step.set(NICKNAME, it) }
        input.avatarUrl?.let { step.set(AVATAR_URL, it) }
        input.bio?.let { step.set(BIO, it) }
        input.city?.let { step.set(CITY, it) }
        input.countryCode?.let { step.set(COUNTRY_CODE, it) }
        step.where(ID.eq(id)).execute()
        return findById(id) ?: error("User $id not found")
    }

    private fun toUser(record: Record): User = User(
        id = record[ID]!!,
        nickname = record[NICKNAME]!!,
        email = record[EMAIL]!!,
        dateOfBirth = record[DATE_OF_BIRTH]?.toString(),
        avatarUrl = record[AVATAR_URL],
        bio = record[BIO],
        city = record[CITY],
        countryCode = record[COUNTRY_CODE],
        role = UserRole.valueOf(record[ROLE]!!),
        status = UserStatus.valueOf(record[STATUS]!!),
        rulesAcceptedAt = record[RULES_ACCEPTED_AT]!!.toString(),
        emailVerifiedAt = record[EMAIL_VERIFIED_AT]?.toString(),
        lastSeenAt = record[LAST_SEEN_AT]?.toString(),
        createdAt = record[CREATED_AT]!!.toString(),
        updatedAt = record[UPDATED_AT]!!.toString(),
        oauthAccounts = findOauthAccounts(record[ID]!!),
    )

    private fun findOauthAccounts(userId: UUID): List<UserOauthAccount> =
        dsl.select(OAUTH_ID, OAUTH_PROVIDER, OAUTH_PROVIDER_USER_ID, OAUTH_EMAIL, OAUTH_LINKED_AT)
            .from(OAUTH_ACCOUNTS)
            .where(OAUTH_USER_ID.eq(userId))
            .fetch {
                UserOauthAccount(
                    id = it[OAUTH_ID]!!,
                    provider = OauthProvider.valueOf(it[OAUTH_PROVIDER]!!),
                    providerUserId = it[OAUTH_PROVIDER_USER_ID]!!,
                    email = it[OAUTH_EMAIL],
                    linkedAt = it[OAUTH_LINKED_AT]!!.toString(),
                )
            }
}
