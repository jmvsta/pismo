package com.jvmvstv_v.back.letters.service

import com.jvmvstv_v.back.badges.service.LetterRankBadgeService
import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import com.jvmvstv_v.back.letters.repository.LetterRepository
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequestSource
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.notification.model.NotificationType
import com.jvmvstv_v.back.notification.service.NotificationService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

private val OPEN_STATUSES = setOf(LetterStatus.DRAFT, LetterStatus.SENT, LetterStatus.IN_TRANSIT)

@Service
class LetterServiceImpl(
    private val letterRepository: LetterRepository,
    private val matchingRepository: MatchingRepository,
    private val letterRankBadgeService: LetterRankBadgeService,
    private val notificationService: NotificationService,
) : LetterService {
    private val logger = LoggerFactory.getLogger(LetterServiceImpl::class.java)

    override fun findById(id: UUID): Letter? = letterRepository.findById(id)

    override fun forConnection(connectionId: UUID): List<Letter> = letterRepository.findForConnection(connectionId)

    override fun sentLetters(): List<Letter> = letterRepository.findSentByUser(CurrentUser.id)

    override fun receivedLetters(): List<Letter> = letterRepository.findReceivedByUser(CurrentUser.id)

    override fun pendingIncomingLetterCount(): Int = letterRepository.countPendingIncoming(CurrentUser.id)

    override fun createLetter(input: CreateLetterInput): Letter {
        val senderId = CurrentUser.id
        val connection = matchingRepository.findConnectionById(input.connectionId)
            ?: error("Connection ${input.connectionId} not found")
        if (connection.endedAt != null) throw AuthException("This connection has ended")
        val otherId = if (connection.userA.id == senderId) connection.userB.id else connection.userA.id
        if (input.recipientId != otherId) throw AuthException("Recipient must be the other person in this connection")
        requireSendersTurn(connection, senderId)
        val letter = letterRepository.create(senderId, input)
        logger.info("Letter {} created by user {} for user {} in connection {}", letter.id, senderId, otherId, connection.id)
        return letter
    }

    private fun requireSendersTurn(connection: PenPalConnection, senderId: UUID) {
        val letters = letterRepository.findForConnection(connection.id)
        if (letters.any { it.status in OPEN_STATUSES }) {
            throw AuthException("This connection already has a letter in progress")
        }
        val lastDelivered = letters.firstOrNull { it.status == LetterStatus.DELIVERED }
        if (lastDelivered == null) {
            val request = connection.request
            if (request != null && request.source == PenPalRequestSource.MODERATOR_LETTER_REQUEST) {
                val moderatorId = request.addressee.id
                if (senderId != moderatorId) {
                    throw AuthException("Wait for the moderator to send the first letter")
                }
            }
        } else if (lastDelivered.sender.id == senderId) {
            throw AuthException("Wait for your pen pal to reply first")
        }
    }

    override fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter {
        val updated = letterRepository.updateStatus(id, status, location, note)
        logger.info("Letter {} moved to {} (acting user {})", id, status, CurrentUser.idOrNull)
        letterRankBadgeService.awardForLetterCount(updated.sender.id, letterRepository.countSentByUser(updated.sender.id))
        notifyStatusChange(updated, status)
        return updated
    }

    private fun notifyStatusChange(letter: Letter, status: LetterStatus) {
        when (status) {
            LetterStatus.SENT -> notificationService.notify(
                letter.recipient.id,
                NotificationType.LETTER_SENT,
                "A letter is on its way",
                "${letter.sender.nickname} sent you a letter",
            )
            LetterStatus.DELIVERED -> notificationService.notify(
                letter.sender.id,
                NotificationType.LETTER_DELIVERED,
                "Your letter was delivered",
                "${letter.recipient.nickname} received your letter",
            )
            else -> Unit
        }
    }

    override fun confirmDelivery(id: UUID, code: String): Letter {
        val letter = letterRepository.findById(id) ?: error("Letter $id not found")
        if (letter.recipient.id != CurrentUser.id) throw AuthException("Only the recipient can confirm delivery")
        if (letter.status != LetterStatus.SENT && letter.status != LetterStatus.IN_TRANSIT) {
            throw AuthException("This letter isn't awaiting delivery confirmation")
        }
        if (letter.trackingCode != code) throw AuthException("Incorrect code")
        return updateStatus(id, LetterStatus.DELIVERED, null, null)
    }

    override fun submitFeedback(input: SubmitLetterFeedbackInput): LetterFeedback {
        val feedback = letterRepository.submitFeedback(CurrentUser.id, input)
        logger.info("User {} submitted feedback on a letter", CurrentUser.id)
        return feedback
    }
}
