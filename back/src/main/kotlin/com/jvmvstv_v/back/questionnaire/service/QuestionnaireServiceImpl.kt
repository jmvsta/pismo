package com.jvmvstv_v.back.questionnaire.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireTemplateInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import com.jvmvstv_v.back.questionnaire.repository.QuestionnaireRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class QuestionnaireServiceImpl(
    private val questionnaireRepository: QuestionnaireRepository,
) : QuestionnaireService {
    override fun activeQuestionnaire(kind: QuestionnaireKind): QuestionnaireVersion? =
        questionnaireRepository.findActiveVersion(kind)

    override fun questionnaireVersion(id: Int): QuestionnaireVersion? =
        questionnaireRepository.findVersionById(id)

    override fun allVersions(kind: QuestionnaireKind): List<QuestionnaireVersion> {
        CurrentUser.requireAdmin()
        return questionnaireRepository.findAllVersions(kind)
    }

    override fun myResponse(questionnaireVersionId: Int): UserQuestionnaireResponse? =
        questionnaireRepository.findResponse(CurrentUser.id, questionnaireVersionId)

    override fun saveResponse(input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse =
        questionnaireRepository.saveResponse(CurrentUser.id, input)

    override fun submitResponse(id: UUID): UserQuestionnaireResponse =
        questionnaireRepository.submitResponse(id)

    override fun saveTemplate(input: SaveQuestionnaireTemplateInput): QuestionnaireVersion {
        CurrentUser.requireAdmin()
        return questionnaireRepository.saveTemplate(input.kind, input.definition)
    }
}
