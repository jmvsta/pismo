package com.jvmvstv_v.back.matching.service

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.SuggestedProfile
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

interface MatchingService {
    fun myMatches(limit: Int?): List<UserMatch>
    fun penPalRequests(status: PenPalRequestStatus?): List<PenPalRequest>
    fun myConnections(): List<PenPalConnection>
    fun sendPenPalRequest(addresseeId: UUID, message: String?): PenPalRequest
    fun respondToPenPalRequest(id: UUID, accept: Boolean): PenPalRequest
    fun cancelPenPalRequest(id: UUID): PenPalRequest
    fun endConnection(id: UUID): PenPalConnection
    fun suggestedProfiles(search: String?, limit: Int?, offset: Int?): List<SuggestedProfile>
    fun hiddenProfiles(limit: Int?, offset: Int?): List<SuggestedProfile>
    fun hideProfile(userId: UUID)
    fun pendingIncomingRequestCount(): Int

    // Shared by user(id), questionnaire-by-user, and this service's own results -- every
    // path that can expose another user's profile before a match needs the same redaction.
    fun redactUnlessMatched(user: User): User
}
