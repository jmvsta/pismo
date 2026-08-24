package com.jvmvstv_v.back.matching.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MatchingServiceImpl(private val matchingRepository: MatchingRepository) : MatchingService {
    override fun myMatches(limit: Int?): List<UserMatch> =
        matchingRepository.findMatchesForUser(CurrentUser.id, limit)

    override fun penPalRequests(status: PenPalRequestStatus?): List<PenPalRequest> =
        matchingRepository.findRequestsForUser(CurrentUser.id, status)

    override fun myConnections(): List<PenPalConnection> =
        matchingRepository.findConnectionsForUser(CurrentUser.id)

    override fun sendPenPalRequest(addresseeId: UUID, message: String?): PenPalRequest =
        matchingRepository.createRequest(CurrentUser.id, addresseeId, message)

    override fun respondToPenPalRequest(id: UUID, accept: Boolean): PenPalRequest =
        matchingRepository.respondToRequest(id, accept)

    override fun cancelPenPalRequest(id: UUID): PenPalRequest = matchingRepository.cancelRequest(id)

    override fun endConnection(id: UUID): PenPalConnection = matchingRepository.endConnection(id)
}
