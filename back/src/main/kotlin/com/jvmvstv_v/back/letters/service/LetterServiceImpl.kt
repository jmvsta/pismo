package com.jvmvstv_v.back.letters.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import com.jvmvstv_v.back.letters.repository.LetterRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class LetterServiceImpl(private val letterRepository: LetterRepository) : LetterService {
    override fun findById(id: UUID): Letter? = letterRepository.findById(id)

    override fun forConnection(connectionId: UUID): List<Letter> = letterRepository.findForConnection(connectionId)

    override fun sentLetters(): List<Letter> = letterRepository.findSentByUser(CurrentUser.id)

    override fun receivedLetters(): List<Letter> = letterRepository.findReceivedByUser(CurrentUser.id)

    override fun createLetter(input: CreateLetterInput): Letter = letterRepository.create(CurrentUser.id, input)

    override fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter =
        letterRepository.updateStatus(id, status, location, note)

    override fun submitFeedback(input: SubmitLetterFeedbackInput): LetterFeedback =
        letterRepository.submitFeedback(CurrentUser.id, input)
}
