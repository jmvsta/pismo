package com.jvmvstv_v.back.questionnaire.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireTemplateInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import com.jvmvstv_v.back.questionnaire.repository.QuestionnaireRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class QuestionnaireServiceImpl(
    private val questionnaireRepository: QuestionnaireRepository,
) : QuestionnaireService {
    private val logger = LoggerFactory.getLogger(QuestionnaireServiceImpl::class.java)

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

    override fun response(userId: UUID, questionnaireVersionId: Int): UserQuestionnaireResponse? =
        questionnaireRepository.findResponse(userId, questionnaireVersionId)

    override fun saveResponse(input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse {
        val saved = questionnaireRepository.saveResponse(CurrentUser.id, input)
        logger.info("User {} saved questionnaire response {}", CurrentUser.id, saved.id)
        return saved
    }

    override fun submitResponse(id: UUID): UserQuestionnaireResponse {
        val submitted = questionnaireRepository.submitResponse(id)
        logger.info("User {} submitted questionnaire response {}", CurrentUser.id, id)
        return submitted
    }

    override fun saveTemplate(input: SaveQuestionnaireTemplateInput): QuestionnaireVersion {
        CurrentUser.requireAdmin()
        val version = questionnaireRepository.saveTemplate(input.kind, input.definition)
        logger.info("Admin {} saved a new {} questionnaire template (version {})", CurrentUser.id, input.kind, version.id)
        return version
    }
}
