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
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.notification.model.NotificationType
import com.jvmvstv_v.back.notification.service.NotificationService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

private val IN_PROGRESS_STATUSES = setOf(LetterStatus.DRAFT, LetterStatus.SENT, LetterStatus.IN_TRANSIT)

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
        val draft = letterRepository.create(senderId, input)
        val letter = updateStatus(draft.id, LetterStatus.SENT, null, null)
        logger.info("Letter {} sent by user {} to user {} in connection {}", letter.id, senderId, otherId, connection.id)
        return letter
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

    override fun confirmDelivery(id: UUID): Letter {
        val letter = letterRepository.findById(id) ?: error("Letter $id not found")
        if (letter.recipient.id != CurrentUser.id) throw AuthException("Only the recipient can mark a letter as received")
        if (letter.status != LetterStatus.SENT && letter.status != LetterStatus.IN_TRANSIT) {
            throw AuthException("This letter isn't awaiting delivery confirmation")
        }
        logger.info("User {} marked letter {} as received", CurrentUser.id, id)
        return updateStatus(id, LetterStatus.DELIVERED, null, null)
    }

    override fun cancelLetter(id: UUID): Boolean {
        val letter = letterRepository.findById(id) ?: error("Letter $id not found")
        if (letter.sender.id != CurrentUser.id) throw AuthException("Only the sender can cancel a letter")
        if (letter.status !in IN_PROGRESS_STATUSES) throw AuthException("This letter has already been delivered")
        val deleted = letterRepository.delete(id)
        logger.info("User {} cancelled letter {} (was {}), deleted={}", CurrentUser.id, id, letter.status, deleted)
        return deleted
    }

    override fun submitFeedback(input: SubmitLetterFeedbackInput): LetterFeedback {
        val feedback = letterRepository.submitFeedback(CurrentUser.id, input)
        logger.info("User {} submitted feedback on a letter", CurrentUser.id)
        return feedback
    }
}
