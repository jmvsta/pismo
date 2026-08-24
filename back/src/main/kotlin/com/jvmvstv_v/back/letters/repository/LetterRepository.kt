package com.jvmvstv_v.back.letters.repository

import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import java.util.UUID

interface LetterRepository {
    fun findById(id: UUID): Letter?
    fun findForConnection(connectionId: UUID): List<Letter>
    fun findSentByUser(userId: UUID): List<Letter>
    fun findReceivedByUser(userId: UUID): List<Letter>
    fun create(senderId: UUID, input: CreateLetterInput): Letter
    fun updateStatus(id: UUID, status: LetterStatus, location: String?, note: String?): Letter
    fun submitFeedback(raterId: UUID, input: SubmitLetterFeedbackInput): LetterFeedback
}
