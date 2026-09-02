package com.jvmvstv_v.back.letters.service

import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import java.util.UUID

interface LetterService {
    fun findById(id: UUID): Letter?
    fun forConnection(connectionId: UUID): List<Letter>
    fun sentLetters(): List<Letter>
    fun receivedLetters(): List<Letter>
    fun pendingIncomingLetterCount(): Int
    fun createLetter(input: CreateLetterInput): Letter
    fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter
    fun confirmDelivery(id: UUID, code: String): Letter
    fun submitFeedback(input: SubmitLetterFeedbackInput): LetterFeedback
}
