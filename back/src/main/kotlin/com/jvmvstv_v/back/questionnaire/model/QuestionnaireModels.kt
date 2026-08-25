package com.jvmvstv_v.back.questionnaire.model

import com.jvmvstv_v.back.user.model.User
import java.util.UUID

enum class QuestionnaireKind { REGISTRATION, EXPERIENCE }

data class QuestionnaireVersion(
    val id: Int,
    val kind: QuestionnaireKind,
    val version: Int,
    val definition: String,
    val isActive: Boolean,
    val createdAt: String,
)

data class UserQuestionnaireResponse(
    val id: UUID,
    val user: User,
    val questionnaireVersion: QuestionnaireVersion,
    val answers: String,
    val submittedAt: String?,
    val createdAt: String,
    val updatedAt: String,
)

data class SaveQuestionnaireResponseInput(
    val questionnaireVersionId: Int,
    val answers: String,
)

data class SaveQuestionnaireTemplateInput(
    val kind: QuestionnaireKind,
    val definition: String,
)
