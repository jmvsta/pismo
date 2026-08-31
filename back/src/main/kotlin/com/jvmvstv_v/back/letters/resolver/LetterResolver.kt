package com.jvmvstv_v.back.letters.resolver

import com.jvmvstv_v.back.letters.model.CreateLetterInput
import com.jvmvstv_v.back.letters.model.Letter
import com.jvmvstv_v.back.letters.model.LetterFeedback
import com.jvmvstv_v.back.letters.model.LetterStatus
import com.jvmvstv_v.back.letters.model.SubmitLetterFeedbackInput
import com.jvmvstv_v.back.letters.service.LetterService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class LetterResolver(private val letterService: LetterService) {
    @QueryMapping
    fun letter(@Argument id: UUID): Letter? = letterService.findById(id)

    @QueryMapping
    fun lettersForConnection(@Argument connectionId: UUID): List<Letter> = letterService.forConnection(connectionId)

    @QueryMapping
    fun sentLetters(): List<Letter> = letterService.sentLetters()

    @QueryMapping
    fun receivedLetters(): List<Letter> = letterService.receivedLetters()

    @QueryMapping
    fun pendingIncomingLetterCount(): Int = letterService.pendingIncomingLetterCount()

    @MutationMapping
    fun createLetter(@Argument input: CreateLetterInput): Letter = letterService.createLetter(input)

    @MutationMapping
    fun updateLetterStatus(
        @Argument id: UUID,
        @Argument status: LetterStatus,
        @Argument location: String?,
        @Argument note: String?,
    ): Letter = letterService.updateStatus(id, status, location, note)

    @MutationMapping
    fun confirmLetterDelivery(@Argument id: UUID, @Argument code: String): Letter =
        letterService.confirmDelivery(id, code)

    @MutationMapping
    fun submitLetterFeedback(@Argument input: SubmitLetterFeedbackInput): LetterFeedback =
        letterService.submitFeedback(input)
}
