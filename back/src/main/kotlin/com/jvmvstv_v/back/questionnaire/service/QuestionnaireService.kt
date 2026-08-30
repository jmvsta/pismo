package com.jvmvstv_v.back.questionnaire.service

import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireTemplateInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import java.util.UUID

interface QuestionnaireService {
    fun activeQuestionnaire(kind: QuestionnaireKind): QuestionnaireVersion?
    fun questionnaireVersion(id: Int): QuestionnaireVersion?
    fun allVersions(kind: QuestionnaireKind): List<QuestionnaireVersion>
    fun myResponse(questionnaireVersionId: Int): UserQuestionnaireResponse?
    fun response(userId: UUID, questionnaireVersionId: Int): UserQuestionnaireResponse?
    fun saveResponse(input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse
    fun submitResponse(id: UUID): UserQuestionnaireResponse
    fun saveTemplate(input: SaveQuestionnaireTemplateInput): QuestionnaireVersion
}
