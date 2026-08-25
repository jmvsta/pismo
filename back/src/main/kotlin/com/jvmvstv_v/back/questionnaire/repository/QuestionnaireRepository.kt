package com.jvmvstv_v.back.questionnaire.repository

import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import java.util.UUID

interface QuestionnaireRepository {
    fun findActiveVersion(kind: QuestionnaireKind): QuestionnaireVersion?
    fun findVersionById(id: Int): QuestionnaireVersion?
    fun findAllVersions(kind: QuestionnaireKind): List<QuestionnaireVersion>
    fun findResponse(userId: UUID, questionnaireVersionId: Int): UserQuestionnaireResponse?
    fun saveResponse(userId: UUID, input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse
    fun submitResponse(id: UUID): UserQuestionnaireResponse
    fun saveTemplate(kind: QuestionnaireKind, definition: String): QuestionnaireVersion
}
