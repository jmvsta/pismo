package com.jvmvstv_v.back.matching.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.SuggestedProfile
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.user.model.User
import org.springframework.stereotype.Service
import java.util.UUID

private const val DEFAULT_SUGGESTED_PROFILES_LIMIT = 20

@Service
class MatchingServiceImpl(private val matchingRepository: MatchingRepository) : MatchingService {
    override fun myMatches(limit: Int?): List<UserMatch> {
        val viewerId = CurrentUser.id
        return matchingRepository.findMatchesForUser(viewerId, limit).map {
            it.copy(userA = redactUnlessMatched(it.userA, viewerId), userB = redactUnlessMatched(it.userB, viewerId))
        }
    }

    override fun penPalRequests(status: PenPalRequestStatus?): List<PenPalRequest> {
        val viewerId = CurrentUser.id
        return matchingRepository.findRequestsForUser(viewerId, status).map {
            it.copy(
                requester = redactUnlessMatched(it.requester, viewerId),
                addressee = redactUnlessMatched(it.addressee, viewerId),
            )
        }
    }

    override fun myConnections(): List<PenPalConnection> =
        matchingRepository.findConnectionsForUser(CurrentUser.id)

    override fun sendPenPalRequest(addresseeId: UUID, message: String?): PenPalRequest {
        val requesterId = CurrentUser.id
        if (addresseeId == requesterId) throw AuthException("You can't send a pen pal request to yourself")
        if (matchingRepository.isConnected(requesterId, addresseeId)) {
            throw AuthException("You're already pen pals with this person")
        }
        val hasPending = matchingRepository.findRequestsForUser(requesterId, PenPalRequestStatus.PENDING)
            .any { it.requester.id == requesterId && it.addressee.id == addresseeId }
        if (hasPending) throw AuthException("You already have a pending request to this person")
        return matchingRepository.createRequest(requesterId, addresseeId, message)
    }

    override fun respondToPenPalRequest(id: UUID, accept: Boolean): PenPalRequest {
        val request = matchingRepository.findRequestById(id) ?: error("Pen pal request $id not found")
        if (request.addressee.id != CurrentUser.id) {
            throw AuthException("Only the addressee can respond to this request")
        }
        if (request.status != PenPalRequestStatus.PENDING) {
            throw AuthException("This request is no longer pending")
        }
        return matchingRepository.respondToRequest(id, accept)
    }

    override fun cancelPenPalRequest(id: UUID): PenPalRequest {
        val request = matchingRepository.findRequestById(id) ?: error("Pen pal request $id not found")
        if (request.requester.id != CurrentUser.id) {
            throw AuthException("Only the requester can cancel this request")
        }
        if (request.status != PenPalRequestStatus.PENDING) {
            throw AuthException("This request is no longer pending")
        }
        return matchingRepository.cancelRequest(id)
    }

    override fun endConnection(id: UUID): PenPalConnection {
        val connection = matchingRepository.findConnectionById(id) ?: error("Pen pal connection $id not found")
        if (connection.userA.id != CurrentUser.id && connection.userB.id != CurrentUser.id) {
            throw AuthException("Only a member of this connection can end it")
        }
        if (connection.endedAt != null) {
            throw AuthException("This connection has already ended")
        }
        return matchingRepository.endConnection(id)
    }

    override fun suggestedProfiles(search: String?, limit: Int?, offset: Int?): List<SuggestedProfile> {
        val viewerId = CurrentUser.id
        return matchingRepository.findSuggestedProfiles(
            viewerId,
            search,
            limit ?: DEFAULT_SUGGESTED_PROFILES_LIMIT,
            offset ?: 0,
        ).map { it.copy(user = redactUnlessMatched(it.user, viewerId)) }
    }

    override fun hiddenProfiles(limit: Int?, offset: Int?): List<SuggestedProfile> {
        val viewerId = CurrentUser.id
        return matchingRepository.findHiddenProfiles(
            viewerId,
            limit ?: DEFAULT_SUGGESTED_PROFILES_LIMIT,
            offset ?: 0,
        ).map { it.copy(user = redactUnlessMatched(it.user, viewerId)) }
    }

    override fun hideProfile(userId: UUID) = matchingRepository.hideProfile(CurrentUser.id, userId)

    override fun pendingIncomingRequestCount(): Int = matchingRepository.countPendingIncomingRequests(CurrentUser.id)

    override fun redactUnlessMatched(user: User): User = redactUnlessMatched(user, CurrentUser.idOrNull)

    private fun redactUnlessMatched(user: User, viewerId: UUID?): User =
        if (viewerId != null && (user.id == viewerId || matchingRepository.isConnected(viewerId, user.id))) {
            user
        } else {
            user.copy(avatarImageId = null)
        }
}
