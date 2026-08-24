package com.jvmvstv_v.back.matching.service

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.UserMatch
import java.util.UUID

interface MatchingService {
    fun myMatches(limit: Int?): List<UserMatch>
    fun penPalRequests(status: PenPalRequestStatus?): List<PenPalRequest>
    fun myConnections(): List<PenPalConnection>
    fun sendPenPalRequest(addresseeId: UUID, message: String?): PenPalRequest
    fun respondToPenPalRequest(id: UUID, accept: Boolean): PenPalRequest
    fun cancelPenPalRequest(id: UUID): PenPalRequest
    fun endConnection(id: UUID): PenPalConnection
}
