package com.jvmvstv_v.back.matching.repository

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
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
        dsl.update(REQUESTS)
            .set(R_STATUS, newStatus.name)
            .set(R_RESPONDED_AT, OffsetDateTime.now())
            .where(R_ID.eq(id))
            .execute()
        if (accept) {
            val userA = minOf(request.requester.id, request.addressee.id)
            val userB = maxOf(request.requester.id, request.addressee.id)
            dsl.insertInto(CONNECTIONS)
                .columns(C_ID, C_USER_A, C_USER_B, C_REQUEST_ID, C_ESTABLISHED_AT)
                .values(UUID.randomUUID(), userA, userB, id, OffsetDateTime.now())
                .execute()
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

    private fun findRequestById(id: UUID): PenPalRequest? =
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
