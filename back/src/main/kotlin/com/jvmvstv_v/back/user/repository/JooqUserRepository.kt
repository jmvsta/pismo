package com.jvmvstv_v.back.user.repository

import com.jvmvstv_v.back.common.AuthenticatedPrincipal
import com.jvmvstv_v.back.user.model.OauthProvider
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserCredentials
import com.jvmvstv_v.back.user.model.UserOauthAccount
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.model.UserStatus
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqUserRepository(private val dsl: DSLContext) : UserRepository {
    private val USERS = DSL.table("users")
    private val ID = DSL.field("id", SQLDataType.UUID)
    private val NICKNAME = DSL.field("nickname", SQLDataType.VARCHAR)
    private val EMAIL = DSL.field("email", SQLDataType.VARCHAR)
    private val DATE_OF_BIRTH = DSL.field("date_of_birth", SQLDataType.LOCALDATE)
    private val AVATAR_IMAGE_ID = DSL.field("avatar_image_id", SQLDataType.UUID)
    private val BIO = DSL.field("bio", SQLDataType.VARCHAR)
    private val CITY = DSL.field("city", SQLDataType.VARCHAR)
    private val COUNTRY_CODE = DSL.field("country_code", SQLDataType.VARCHAR)
    private val ROLE = DSL.field("role", SQLDataType.VARCHAR)
    private val STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val PASSWORD_HASH = DSL.field("password_hash", SQLDataType.VARCHAR)
    private val RULES_ACCEPTED_AT = DSL.field("rules_accepted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val EMAIL_VERIFIED_AT = DSL.field("email_verified_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val LAST_SEEN_AT = DSL.field("last_seen_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val DELETED_AT = DSL.field("deleted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val AUTH_TOKEN = DSL.field("auth_token", SQLDataType.VARCHAR)
    private val AUTH_TOKEN_EXPIRES_AT = DSL.field("auth_token_expires_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val EMAIL_VERIFICATION_CODE = DSL.field("email_verification_code", SQLDataType.VARCHAR)
    private val EMAIL_VERIFICATION_CODE_EXPIRES_AT =
        DSL.field("email_verification_code_expires_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val OAUTH_ACCOUNTS = DSL.table("user_oauth_accounts")
    private val OAUTH_ID = DSL.field("id", SQLDataType.UUID)
    private val OAUTH_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val OAUTH_PROVIDER = DSL.field("provider", SQLDataType.VARCHAR)
    private val OAUTH_PROVIDER_USER_ID = DSL.field("provider_user_id", SQLDataType.VARCHAR)
    private val OAUTH_EMAIL = DSL.field("email", SQLDataType.VARCHAR)
    private val OAUTH_LINKED_AT = DSL.field("linked_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findById(id: UUID): User? =
        dsl.select(ID, NICKNAME, EMAIL, DATE_OF_BIRTH, AVATAR_IMAGE_ID, BIO, CITY, COUNTRY_CODE, ROLE, STATUS,
            RULES_ACCEPTED_AT, EMAIL_VERIFIED_AT, LAST_SEEN_AT, CREATED_AT, UPDATED_AT)
            .from(USERS)
            .where(ID.eq(id)).and(DELETED_AT.isNull)
            .fetchOne { toUser(it) }

    override fun update(id: UUID, input: UpdateProfileInput): User {
        val step = dsl.update(USERS).set(UPDATED_AT, OffsetDateTime.now())
        input.nickname?.let { step.set(NICKNAME, it) }
        input.bio?.let { step.set(BIO, it) }
        input.city?.let { step.set(CITY, it) }
        input.countryCode?.let { step.set(COUNTRY_CODE, it) }
        step.where(ID.eq(id)).execute()
        return findById(id) ?: error("User $id not found")
    }

    override fun setAvatarImage(userId: UUID, imageId: UUID): User {
        dsl.update(USERS)
            .set(AVATAR_IMAGE_ID, imageId)
            .set(UPDATED_AT, OffsetDateTime.now())
            .where(ID.eq(userId))
            .execute()
        return findById(userId) ?: error("User $userId not found")
    }

    override fun create(input: RegisterInput, passwordHash: String): User {
        val id = UUID.randomUUID()
        dsl.insertInto(USERS)
            .columns(ID, NICKNAME, EMAIL, PASSWORD_HASH, DATE_OF_BIRTH, RULES_ACCEPTED_AT)
            .values(id, input.nickname, input.email, passwordHash, input.dateOfBirth?.let { LocalDate.parse(it) }, OffsetDateTime.now())
            .execute()
        return findById(id) ?: error("User $id not found after registration")
    }

    override fun existsByEmailOrNickname(email: String, nickname: String): Boolean =
        dsl.fetchExists(
            dsl.selectOne().from(USERS)
                .where(DSL.lower(EMAIL).eq(email.lowercase())).or(DSL.lower(NICKNAME).eq(nickname.lowercase()))
        )

    override fun findCredentialsByEmail(email: String): UserCredentials? =
        dsl.select(ID, PASSWORD_HASH)
            .from(USERS)
            .where(DSL.lower(EMAIL).eq(email.lowercase())).and(DELETED_AT.isNull)
            .fetchOne { UserCredentials(id = it[ID]!!, passwordHash = it[PASSWORD_HASH]) }

    override fun setAuthToken(userId: UUID, token: String, expiresAt: OffsetDateTime) {
        dsl.update(USERS)
            .set(AUTH_TOKEN, token)
            .set(AUTH_TOKEN_EXPIRES_AT, expiresAt)
            .where(ID.eq(userId))
            .execute()
    }

    override fun clearAuthToken(userId: UUID) {
        dsl.update(USERS)
            .set(AUTH_TOKEN, null as String?)
            .set(AUTH_TOKEN_EXPIRES_AT, null as OffsetDateTime?)
            .where(ID.eq(userId))
            .execute()
    }

    override fun findActiveUserByToken(token: String): AuthenticatedPrincipal? =
        dsl.select(ID, EMAIL, ROLE, EMAIL_VERIFIED_AT)
            .from(USERS)
            .where(AUTH_TOKEN.eq(token))
            .and(AUTH_TOKEN_EXPIRES_AT.gt(OffsetDateTime.now()))
            .and(DELETED_AT.isNull)
            .fetchOne {
                AuthenticatedPrincipal(
                    id = it[ID]!!,
                    email = it[EMAIL]!!,
                    role = UserRole.valueOf(it[ROLE]!!),
                    emailVerifiedAt = it[EMAIL_VERIFIED_AT]?.toString(),
                )
            }

    override fun setEmailVerificationCode(userId: UUID, code: String, expiresAt: OffsetDateTime) {
        dsl.update(USERS)
            .set(EMAIL_VERIFICATION_CODE, code)
            .set(EMAIL_VERIFICATION_CODE_EXPIRES_AT, expiresAt)
            .where(ID.eq(userId))
            .execute()
    }

    override fun findEmailVerificationCode(userId: UUID): Pair<String, OffsetDateTime>? {
        val record = dsl.select(EMAIL_VERIFICATION_CODE, EMAIL_VERIFICATION_CODE_EXPIRES_AT)
            .from(USERS)
            .where(ID.eq(userId))
            .fetchOne() ?: return null
        val code = record[EMAIL_VERIFICATION_CODE] ?: return null
        val expiresAt = record[EMAIL_VERIFICATION_CODE_EXPIRES_AT] ?: return null
        return code to expiresAt
    }

    override fun markEmailVerified(userId: UUID) {
        dsl.update(USERS)
            .set(EMAIL_VERIFIED_AT, OffsetDateTime.now())
            .set(EMAIL_VERIFICATION_CODE, null as String?)
            .set(EMAIL_VERIFICATION_CODE_EXPIRES_AT, null as OffsetDateTime?)
            .where(ID.eq(userId))
            .execute()
    }

    override fun findAll(): List<User> =
        dsl.select(ID, NICKNAME, EMAIL, DATE_OF_BIRTH, AVATAR_IMAGE_ID, BIO, CITY, COUNTRY_CODE, ROLE, STATUS,
            RULES_ACCEPTED_AT, EMAIL_VERIFIED_AT, LAST_SEEN_AT, CREATED_AT, UPDATED_AT)
            .from(USERS)
            .where(DELETED_AT.isNull)
            .orderBy(CREATED_AT.desc())
            .fetch { toUser(it) }

    override fun setStatus(userId: UUID, status: UserStatus): User {
        dsl.update(USERS).set(STATUS, status.name).set(UPDATED_AT, OffsetDateTime.now()).where(ID.eq(userId)).execute()
        return findById(userId) ?: error("User $userId not found")
    }

    override fun setRole(userId: UUID, role: UserRole): User {
        dsl.update(USERS).set(ROLE, role.name).set(UPDATED_AT, OffsetDateTime.now()).where(ID.eq(userId)).execute()
        return findById(userId) ?: error("User $userId not found")
    }

    override fun findUserIdByOauthAccount(provider: OauthProvider, providerUserId: String): UUID? =
        dsl.select(OAUTH_USER_ID)
            .from(OAUTH_ACCOUNTS)
            .where(OAUTH_PROVIDER.eq(provider.name)).and(OAUTH_PROVIDER_USER_ID.eq(providerUserId))
            .fetchOne { it[OAUTH_USER_ID] }

    override fun linkOauthAccount(userId: UUID, provider: OauthProvider, providerUserId: String, email: String?) {
        dsl.insertInto(OAUTH_ACCOUNTS)
            .columns(OAUTH_ID, OAUTH_USER_ID, OAUTH_PROVIDER, OAUTH_PROVIDER_USER_ID, OAUTH_EMAIL, OAUTH_LINKED_AT)
            .values(UUID.randomUUID(), userId, provider.name, providerUserId, email, OffsetDateTime.now())
            .execute()
    }

    override fun createOauthUser(nickname: String, email: String, provider: OauthProvider, providerUserId: String): User {
        val id = UUID.randomUUID()
        dsl.transaction { config ->
            val tx = config.dsl()
            tx.insertInto(USERS)
                .columns(ID, NICKNAME, EMAIL, RULES_ACCEPTED_AT, EMAIL_VERIFIED_AT)
                .values(id, nickname, email, OffsetDateTime.now(), OffsetDateTime.now())
                .execute()
            tx.insertInto(OAUTH_ACCOUNTS)
                .columns(OAUTH_ID, OAUTH_USER_ID, OAUTH_PROVIDER, OAUTH_PROVIDER_USER_ID, OAUTH_EMAIL, OAUTH_LINKED_AT)
                .values(UUID.randomUUID(), id, provider.name, providerUserId, email, OffsetDateTime.now())
                .execute()
        }
        return findById(id) ?: error("User $id not found after oauth registration")
    }

    private fun toUser(record: Record): User = User(
        id = record[ID]!!,
        nickname = record[NICKNAME]!!,
        email = record[EMAIL]!!,
        dateOfBirth = record[DATE_OF_BIRTH]?.toString(),
        avatarImageId = record[AVATAR_IMAGE_ID],
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
