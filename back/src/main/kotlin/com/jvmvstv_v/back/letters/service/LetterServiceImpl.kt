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
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import org.springframework.stereotype.Service
import java.util.UUID

private val OPEN_STATUSES = setOf(LetterStatus.DRAFT, LetterStatus.SENT, LetterStatus.IN_TRANSIT)

@Service
class LetterServiceImpl(
    private val letterRepository: LetterRepository,
    private val matchingRepository: MatchingRepository,
    private val letterRankBadgeService: LetterRankBadgeService,
) : LetterService {
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
        return letterRepository.create(senderId, input)
    }

    private fun requireSendersTurn(connection: PenPalConnection, senderId: UUID) {
        val letters = letterRepository.findForConnection(connection.id)
        if (letters.any { it.status in OPEN_STATUSES }) {
            throw AuthException("This connection already has a letter in progress")
        }
        val lastDelivered = letters.firstOrNull { it.status == LetterStatus.DELIVERED }
        if (lastDelivered == null) {
            val requesterId = connection.request?.requester?.id
            if (requesterId != null && senderId != requesterId) {
                throw AuthException("Only the person who reached out can send the first letter")
            }
        } else if (lastDelivered.sender.id == senderId) {
            throw AuthException("Wait for your pen pal to reply first")
        }
    }

    override fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter {
        val updated = letterRepository.updateStatus(id, status, location, note)
        if (status == LetterStatus.SENT) {
            letterRankBadgeService.awardForLetterCount(updated.sender.id, letterRepository.countSentByUser(updated.sender.id))
        }
        return updated
    }

    override fun confirmDelivery(id: UUID, code: String): Letter {
        val letter = letterRepository.findById(id) ?: error("Letter $id not found")
        if (letter.recipient.id != CurrentUser.id) throw AuthException("Only the recipient can confirm delivery")
        if (letter.status != LetterStatus.SENT && letter.status != LetterStatus.IN_TRANSIT) {
            throw AuthException("This letter isn't awaiting delivery confirmation")
        }
        if (letter.trackingCode != code) throw AuthException("Incorrect code")
        return letterRepository.updateStatus(id, LetterStatus.DELIVERED, null, null)
    }

    override fun submitFeedback(input: SubmitLetterFeedbackInput): LetterFeedback =
        letterRepository.submitFeedback(CurrentUser.id, input)
}
