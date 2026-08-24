package com.jvmvstv_v.back.letters.model

import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

enum class LetterStatus { DRAFT, SENT, IN_TRANSIT, DELIVERED, LOST }

data class Letter(
    val id: UUID,
    val connection: PenPalConnection,
    val sender: User,
    val recipient: User,
    val status: LetterStatus,
    val trackingCode: String?,
    val note: String?,
    val language: Language?,
    val sentAt: String?,
    val deliveredAt: String?,
    val createdAt: String,
    val updatedAt: String,
    val statusEvents: List<LetterStatusEvent>,
    val feedback: LetterFeedback?,
)

data class LetterStatusEvent(
    val id: UUID,
    val status: LetterStatus,
    val location: String?,
    val note: String?,
    val occurredAt: String,
    val createdAt: String,
)

data class LetterFeedback(
    val id: UUID,
    val letter: Letter,
    val rater: User,
    val letterScore: Int,
    val senderScore: Int?,
    val comment: String?,
    val questionnaireVersion: QuestionnaireVersion?,
    val experienceSurvey: String,
    val isPublished: Boolean,
    val createdAt: String,
    val updatedAt: String,
)

data class CreateLetterInput(
    val connectionId: UUID,
    val recipientId: UUID,
    val languageCode: String?,
    val note: String?,
)

data class SubmitLetterFeedbackInput(
    val letterId: UUID,
    val letterScore: Int,
    val senderScore: Int?,
    val comment: String?,
    val questionnaireVersionId: Int?,
    val experienceSurvey: String?,
)
