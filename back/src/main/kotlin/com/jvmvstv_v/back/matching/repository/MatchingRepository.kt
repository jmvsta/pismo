package com.jvmvstv_v.back.matching.repository

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.SuggestedProfile
import com.jvmvstv_v.back.matching.model.UserMatch
import java.util.UUID

interface MatchingRepository {
    fun findMatchesForUser(userId: UUID, limit: Int?): List<UserMatch>
    fun findRequestsForUser(userId: UUID, status: PenPalRequestStatus?): List<PenPalRequest>
    fun findConnectionsForUser(userId: UUID): List<PenPalConnection>
    fun findConnectionById(id: UUID): PenPalConnection?
    fun findRequestById(id: UUID): PenPalRequest?
    fun createRequest(requesterId: UUID, addresseeId: UUID, message: String?): PenPalRequest
    fun respondToRequest(id: UUID, accept: Boolean): PenPalRequest
    fun cancelRequest(id: UUID): PenPalRequest
    fun endConnection(id: UUID): PenPalConnection
    fun findSuggestedProfiles(userId: UUID, search: String?, limit: Int, offset: Int): List<SuggestedProfile>
    fun findHiddenProfiles(userId: UUID, limit: Int, offset: Int): List<SuggestedProfile>
    fun hideProfile(userId: UUID, hiddenUserId: UUID)
    fun isConnected(userAId: UUID, userBId: UUID): Boolean
    fun countPendingIncomingRequests(userId: UUID): Int
}
