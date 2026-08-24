package com.jvmvstv_v.back.matching.repository

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.UserMatch
import java.util.UUID

interface MatchingRepository {
    fun findMatchesForUser(userId: UUID, limit: Int?): List<UserMatch>
    fun findRequestsForUser(userId: UUID, status: PenPalRequestStatus?): List<PenPalRequest>
    fun findConnectionsForUser(userId: UUID): List<PenPalConnection>
    fun findConnectionById(id: UUID): PenPalConnection?
    fun createRequest(requesterId: UUID, addresseeId: UUID, message: String?): PenPalRequest
    fun respondToRequest(id: UUID, accept: Boolean): PenPalRequest
    fun cancelRequest(id: UUID): PenPalRequest
    fun endConnection(id: UUID): PenPalConnection
}
