package com.jvmvstv_v.back.matching.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.SuggestedProfile
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.notification.model.NotificationType
import com.jvmvstv_v.back.notification.service.NotificationService
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

private const val DEFAULT_SUGGESTED_PROFILES_LIMIT = 20

@Service
class MatchingServiceImpl(
    private val matchingRepository: MatchingRepository,
    private val notificationService: NotificationService,
    private val userRepository: UserRepository,
) : MatchingService {
    override fun myMatches(limit: Int?): List<UserMatch> =
        matchingRepository.findMatchesForUser(CurrentUser.id, limit)

    override fun penPalRequests(status: PenPalRequestStatus?): List<PenPalRequest> =
        matchingRepository.findRequestsForUser(CurrentUser.id, status)

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
        val request = matchingRepository.createRequest(requesterId, addresseeId, message)
        notificationService.notify(
            addresseeId,
            NotificationType.PEN_PAL_REQUEST,
            "New pen pal request",
            "${request.requester.nickname} wants to connect",
            subjectId = requesterId,
        )
        return request
    }

    override fun respondToPenPalRequest(id: UUID, accept: Boolean): PenPalRequest {
        val request = matchingRepository.findRequestById(id) ?: error("Pen pal request $id not found")
        if (request.addressee.id != CurrentUser.id) {
            throw AuthException("Only the addressee can respond to this request")
        }
        if (request.status != PenPalRequestStatus.PENDING) {
            throw AuthException("This request is no longer pending")
        }
        val updated = matchingRepository.respondToRequest(id, accept)
        if (accept) {
            notificationService.notify(
                request.requester.id,
                NotificationType.PEN_PAL_ACCEPTED,
                "New pen pal accepted",
                "${request.addressee.nickname} accepted your pen pal request",
                subjectId = request.addressee.id,
            )
        }
        return updated
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

    override fun suggestedProfiles(search: String?, limit: Int?, offset: Int?): List<SuggestedProfile> =
        matchingRepository.findSuggestedProfiles(
            CurrentUser.id,
            search,
            limit ?: DEFAULT_SUGGESTED_PROFILES_LIMIT,
            offset ?: 0,
        )

    override fun hiddenProfiles(limit: Int?, offset: Int?): List<SuggestedProfile> =
        matchingRepository.findHiddenProfiles(
            CurrentUser.id,
            limit ?: DEFAULT_SUGGESTED_PROFILES_LIMIT,
            offset ?: 0,
        )

    override fun hideProfile(userId: UUID) = matchingRepository.hideProfile(CurrentUser.id, userId)

    override fun pendingIncomingRequestCount(): Int = matchingRepository.countPendingIncomingRequests(CurrentUser.id)

    override fun requestLetterFromModerators(): Boolean {
        val requesterId = CurrentUser.id
        val moderators = userRepository.findAll()
            .filter { (it.role == UserRole.MODERATOR || it.role == UserRole.ADMIN) && it.id != requesterId }
        val pendingWithRequester = matchingRepository.findRequestsForUser(requesterId, PenPalRequestStatus.PENDING)
        moderators.forEach { moderator ->
            if (matchingRepository.isConnected(requesterId, moderator.id)) return@forEach
            val existingPending = pendingWithRequester.find {
                (it.requester.id == requesterId && it.addressee.id == moderator.id) ||
                    (it.requester.id == moderator.id && it.addressee.id == requesterId)
            }
            val request = existingPending
                ?: matchingRepository.createRequest(
                    requesterId,
                    moderator.id,
                    "Send me a letter — I'd love a handwritten letter from a moderator.",
                )
            matchingRepository.respondToRequest(request.id, true)
            notificationService.notify(
                moderator.id,
                NotificationType.PEN_PAL_REQUEST,
                "Someone wants a letter",
                "${request.requester.nickname} asked to be sent a letter",
                subjectId = requesterId,
            )
        }
        return true
    }

    override fun redactUnlessMatched(user: User): User = redactUnlessMatched(user, CurrentUser.idOrNull)

    private fun redactUnlessMatched(user: User, viewerId: UUID?): User =
        if (viewerId != null && (user.id == viewerId || matchingRepository.isConnected(viewerId, user.id))) {
            user
        } else {
            user.copy(avatarImageId = null)
        }
}
