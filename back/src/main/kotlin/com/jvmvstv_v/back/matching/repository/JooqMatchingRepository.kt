package com.jvmvstv_v.back.matching.repository

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.SuggestedProfile
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Field
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqMatchingRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : MatchingRepository {
    private val MATCHES = DSL.table("user_matches")
    private val M_USER_A = DSL.field("user_a_id", SQLDataType.UUID)
    private val M_USER_B = DSL.field("user_b_id", SQLDataType.UUID)
    private val M_SCORE = DSL.field("score", SQLDataType.NUMERIC)
    private val M_SHARED_INTERESTS = DSL.field("shared_interests", SQLDataType.VARCHAR.array())
    private val M_COMPUTED_AT = DSL.field("computed_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val REQUESTS = DSL.table("pen_pal_requests")
    private val R_ID = DSL.field("id", SQLDataType.UUID)
    private val R_REQUESTER_ID = DSL.field("requester_id", SQLDataType.UUID)
    private val R_ADDRESSEE_ID = DSL.field("addressee_id", SQLDataType.UUID)
    private val R_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val R_MESSAGE = DSL.field("message", SQLDataType.VARCHAR)
    private val R_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val R_RESPONDED_AT = DSL.field("responded_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val CONNECTIONS = DSL.table("pen_pal_connections")
    private val C_ID = DSL.field("id", SQLDataType.UUID)
    private val C_USER_A = DSL.field("user_a_id", SQLDataType.UUID)
    private val C_USER_B = DSL.field("user_b_id", SQLDataType.UUID)
    private val C_REQUEST_ID = DSL.field("request_id", SQLDataType.UUID)
    private val C_ESTABLISHED_AT = DSL.field("established_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val C_ENDED_AT = DSL.field("ended_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val C_ENDED_BY_ID = DSL.field("ended_by_id", SQLDataType.UUID)

    private val USERS = DSL.table("users")
    private val U_ID = DSL.field(DSL.name("users", "id"), SQLDataType.UUID)
    private val U_NICKNAME = DSL.field(DSL.name("users", "nickname"), SQLDataType.VARCHAR)
    private val U_DELETED_AT = DSL.field(DSL.name("users", "deleted_at"), SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val U_CREATED_AT = DSL.field(DSL.name("users", "created_at"), SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val HIDES = DSL.table("user_profile_hides")
    private val H_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val H_HIDDEN_USER_ID = DSL.field("hidden_user_id", SQLDataType.UUID)
    private val H_HIDDEN_AT = DSL.field("hidden_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findMatchesForUser(userId: UUID, limit: Int?): List<UserMatch> {
        val step = dsl.select(M_USER_A, M_USER_B, M_SCORE, M_SHARED_INTERESTS, M_COMPUTED_AT)
            .from(MATCHES)
            .where(M_USER_A.eq(userId).or(M_USER_B.eq(userId)))
            .orderBy(M_SCORE.desc())
        val query = if (limit != null) step.limit(limit) else step
        return query.fetch { toUserMatch(it) }
    }

    override fun findRequestsForUser(userId: UUID, status: PenPalRequestStatus?): List<PenPalRequest> {
        val step = dsl.select(R_ID, R_REQUESTER_ID, R_ADDRESSEE_ID, R_STATUS, R_MESSAGE, R_CREATED_AT, R_RESPONDED_AT)
            .from(REQUESTS)
            .where(R_REQUESTER_ID.eq(userId).or(R_ADDRESSEE_ID.eq(userId)))
        val query = if (status != null) step.and(R_STATUS.eq(status.name)) else step
        return query.orderBy(R_CREATED_AT.desc()).fetch { toPenPalRequest(it) }
    }

    override fun findConnectionsForUser(userId: UUID): List<PenPalConnection> =
        dsl.select(C_ID, C_USER_A, C_USER_B, C_REQUEST_ID, C_ESTABLISHED_AT, C_ENDED_AT, C_ENDED_BY_ID)
            .from(CONNECTIONS)
            .where(C_USER_A.eq(userId).or(C_USER_B.eq(userId)))
            .orderBy(C_ESTABLISHED_AT.desc())
            .fetch { toPenPalConnection(it) }

    override fun findConnectionById(id: UUID): PenPalConnection? =
        dsl.select(C_ID, C_USER_A, C_USER_B, C_REQUEST_ID, C_ESTABLISHED_AT, C_ENDED_AT, C_ENDED_BY_ID)
            .from(CONNECTIONS)
            .where(C_ID.eq(id))
            .fetchOne { toPenPalConnection(it) }

    override fun createRequest(requesterId: UUID, addresseeId: UUID, message: String?): PenPalRequest {
        val id = UUID.randomUUID()
        dsl.insertInto(REQUESTS)
            .columns(R_ID, R_REQUESTER_ID, R_ADDRESSEE_ID, R_STATUS, R_MESSAGE, R_CREATED_AT)
            .values(id, requesterId, addresseeId, PenPalRequestStatus.PENDING.name, message, OffsetDateTime.now())
            .execute()
        return findRequestById(id) ?: error("Pen pal request $id not found")
    }

    override fun respondToRequest(id: UUID, accept: Boolean): PenPalRequest {
        val request = findRequestById(id) ?: error("Pen pal request $id not found")
        val newStatus = if (accept) PenPalRequestStatus.ACCEPTED else PenPalRequestStatus.DECLINED
        dsl.transaction { config ->
            val tx = config.dsl()
            tx.update(REQUESTS)
                .set(R_STATUS, newStatus.name)
                .set(R_RESPONDED_AT, OffsetDateTime.now())
                .where(R_ID.eq(id))
                .execute()
            if (accept) {
                val (userA, userB) = orderedPair(request.requester.id, request.addressee.id)
                tx.insertInto(CONNECTIONS)
                    .columns(C_ID, C_USER_A, C_USER_B, C_REQUEST_ID, C_ESTABLISHED_AT)
                    .values(UUID.randomUUID(), userA, userB, id, OffsetDateTime.now())
                    .execute()
            }
        }
        return findRequestById(id) ?: error("Pen pal request $id not found")
    }

    override fun cancelRequest(id: UUID): PenPalRequest {
        dsl.update(REQUESTS)
            .set(R_STATUS, PenPalRequestStatus.CANCELLED.name)
            .set(R_RESPONDED_AT, OffsetDateTime.now())
            .where(R_ID.eq(id))
            .execute()
        return findRequestById(id) ?: error("Pen pal request $id not found")
    }

    override fun endConnection(id: UUID): PenPalConnection {
        dsl.update(CONNECTIONS)
            .set(C_ENDED_AT, OffsetDateTime.now())
            .set(C_ENDED_BY_ID, CurrentUser.id)
            .where(C_ID.eq(id))
            .execute()
        return findConnectionById(id) ?: error("Pen pal connection $id not found")
    }

    override fun findSuggestedProfiles(userId: UUID, search: String?, limit: Int, offset: Int): List<SuggestedProfile> {
        val hasIncomingRequest = incomingRequestField(userId)
        val step = dsl.select(U_ID, M_SCORE, M_SHARED_INTERESTS, hasIncomingRequest)
            .from(USERS)
            .leftJoin(MATCHES)
            .on(
                M_USER_A.eq(userId).and(M_USER_B.eq(U_ID))
                    .or(M_USER_B.eq(userId).and(M_USER_A.eq(U_ID)))
            )
            .where(U_ID.ne(userId))
            .and(U_DELETED_AT.isNull)
            .and(U_ID.notIn(dsl.select(H_HIDDEN_USER_ID).from(HIDES).where(H_USER_ID.eq(userId))))
            .and(
                DSL.notExists(
                    dsl.selectOne().from(CONNECTIONS)
                        .where(C_ENDED_AT.isNull)
                        .and(
                            C_USER_A.eq(userId).and(C_USER_B.eq(U_ID))
                                .or(C_USER_B.eq(userId).and(C_USER_A.eq(U_ID)))
                        )
                )
            )
            .and(
                // Once you've reached out, the card disappears from the suggestions feed --
                // they surface again for you only via Pending (if they reciprocate) or Matched.
                DSL.notExists(
                    dsl.selectOne().from(REQUESTS)
                        .where(R_REQUESTER_ID.eq(userId))
                        .and(R_ADDRESSEE_ID.eq(U_ID))
                        .and(R_STATUS.eq(PenPalRequestStatus.PENDING.name))
                )
            )
        val filtered = if (search != null) step.and(U_NICKNAME.containsIgnoreCase(search)) else step
        return filtered
            .orderBy(hasIncomingRequest.desc(), M_SCORE.desc().nullsLast(), U_CREATED_AT.desc())
            .limit(limit)
            .offset(offset)
            .fetch { toSuggestedProfile(it, hasIncomingRequest) }
    }

    override fun findHiddenProfiles(userId: UUID, limit: Int, offset: Int): List<SuggestedProfile> {
        val hasIncomingRequest = incomingRequestField(userId)
        return dsl.select(U_ID, M_SCORE, M_SHARED_INTERESTS, hasIncomingRequest)
            .from(HIDES)
            .join(USERS).on(U_ID.eq(H_HIDDEN_USER_ID))
            .leftJoin(MATCHES)
            .on(
                M_USER_A.eq(userId).and(M_USER_B.eq(U_ID))
                    .or(M_USER_B.eq(userId).and(M_USER_A.eq(U_ID)))
            )
            .where(H_USER_ID.eq(userId))
            .and(U_DELETED_AT.isNull)
            .orderBy(H_HIDDEN_AT.desc())
            .limit(limit)
            .offset(offset)
            .fetch { toSuggestedProfile(it, hasIncomingRequest) }
    }

    override fun hideProfile(userId: UUID, hiddenUserId: UUID) {
        dsl.insertInto(HIDES)
            .columns(H_USER_ID, H_HIDDEN_USER_ID, H_HIDDEN_AT)
            .values(userId, hiddenUserId, OffsetDateTime.now())
            .onConflictDoNothing()
            .execute()
    }

    override fun isConnected(userAId: UUID, userBId: UUID): Boolean {
        val (orderedA, orderedB) = orderedPair(userAId, userBId)
        return dsl.fetchExists(
            dsl.selectOne().from(CONNECTIONS)
                .where(C_USER_A.eq(orderedA)).and(C_USER_B.eq(orderedB)).and(C_ENDED_AT.isNull)
        )
    }

    // pen_pal_connections' user_a_id < user_b_id check constraint is enforced by Postgres'
    // unsigned byte-wise uuid comparison -- java.util.UUID#compareTo is a SIGNED comparison of
    // the high/low 64 bits instead, which disagrees with Postgres for any pair straddling the
    // 0x8 boundary in the first hex digit. Comparing the canonical string form sidesteps that:
    // hex-digit ASCII ordering matches byte value ordering, so it always matches Postgres.
    private fun orderedPair(a: UUID, b: UUID): Pair<UUID, UUID> =
        if (a.toString() < b.toString()) a to b else b to a

    override fun countPendingIncomingRequests(userId: UUID): Int =
        dsl.selectCount().from(REQUESTS)
            .where(R_ADDRESSEE_ID.eq(userId))
            .and(R_STATUS.eq(PenPalRequestStatus.PENDING.name))
            .fetchOne(0, Int::class.java) ?: 0

    private fun incomingRequestField(userId: UUID) = DSL.field(
        DSL.exists(
            dsl.selectOne().from(REQUESTS)
                .where(R_REQUESTER_ID.eq(U_ID))
                .and(R_ADDRESSEE_ID.eq(userId))
                .and(R_STATUS.eq(PenPalRequestStatus.PENDING.name))
        )
    )

    private fun toSuggestedProfile(record: Record, hasIncomingRequest: Field<Boolean>): SuggestedProfile =
        SuggestedProfile(
            user = userRepository.findById(record[U_ID]!!) ?: error("User not found"),
            score = record[M_SCORE]?.toDouble(),
            sharedInterests = record[M_SHARED_INTERESTS]?.toList() ?: emptyList(),
            hasIncomingRequest = record[hasIncomingRequest] ?: false,
        )

    override fun findRequestById(id: UUID): PenPalRequest? =
        dsl.select(R_ID, R_REQUESTER_ID, R_ADDRESSEE_ID, R_STATUS, R_MESSAGE, R_CREATED_AT, R_RESPONDED_AT)
            .from(REQUESTS)
            .where(R_ID.eq(id))
            .fetchOne { toPenPalRequest(it) }

    private fun toUserMatch(record: Record): UserMatch = UserMatch(
        userA = userRepository.findById(record[M_USER_A]!!) ?: error("User ${record[M_USER_A]} not found"),
        userB = userRepository.findById(record[M_USER_B]!!) ?: error("User ${record[M_USER_B]} not found"),
        score = record[M_SCORE]!!.toDouble(),
        sharedInterests = record[M_SHARED_INTERESTS]?.toList() ?: emptyList(),
        computedAt = record[M_COMPUTED_AT]!!.toString(),
    )

    private fun toPenPalRequest(record: Record): PenPalRequest = PenPalRequest(
        id = record[R_ID]!!,
        requester = userRepository.findById(record[R_REQUESTER_ID]!!) ?: error("User not found"),
        addressee = userRepository.findById(record[R_ADDRESSEE_ID]!!) ?: error("User not found"),
        status = PenPalRequestStatus.valueOf(record[R_STATUS]!!),
        message = record[R_MESSAGE],
        createdAt = record[R_CREATED_AT]!!.toString(),
        respondedAt = record[R_RESPONDED_AT]?.toString(),
    )

    private fun toPenPalConnection(record: Record): PenPalConnection = PenPalConnection(
        id = record[C_ID]!!,
        userA = userRepository.findById(record[C_USER_A]!!) ?: error("User not found"),
        userB = userRepository.findById(record[C_USER_B]!!) ?: error("User not found"),
        request = record[C_REQUEST_ID]?.let { findRequestById(it) },
        establishedAt = record[C_ESTABLISHED_AT]!!.toString(),
        endedAt = record[C_ENDED_AT]?.toString(),
        endedBy = record[C_ENDED_BY_ID]?.let { userRepository.findById(it) },
    )
}
