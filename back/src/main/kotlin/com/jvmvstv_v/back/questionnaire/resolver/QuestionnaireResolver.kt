package com.jvmvstv_v.back.questionnaire.resolver

import com.jvmvstv_v.back.questionnaire.model.QuestionnaireKind
import com.jvmvstv_v.back.questionnaire.model.QuestionnaireVersion
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireResponseInput
import com.jvmvstv_v.back.questionnaire.model.SaveQuestionnaireTemplateInput
import com.jvmvstv_v.back.questionnaire.model.UserQuestionnaireResponse
import com.jvmvstv_v.back.questionnaire.service.QuestionnaireService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class QuestionnaireResolver(private val questionnaireService: QuestionnaireService) {
    @QueryMapping
    fun activeQuestionnaire(@Argument kind: QuestionnaireKind): QuestionnaireVersion? =
        questionnaireService.activeQuestionnaire(kind)

    @QueryMapping
    fun questionnaireVersion(@Argument id: Int): QuestionnaireVersion? =
        questionnaireService.questionnaireVersion(id)

    @QueryMapping
    fun myQuestionnaireResponse(@Argument questionnaireVersionId: Int): UserQuestionnaireResponse? =
        questionnaireService.myResponse(questionnaireVersionId)

    @QueryMapping
    fun userQuestionnaireResponse(@Argument userId: UUID, @Argument questionnaireVersionId: Int): UserQuestionnaireResponse? =
        questionnaireService.response(userId, questionnaireVersionId)

    @QueryMapping
    fun questionnaireVersions(@Argument kind: QuestionnaireKind): List<QuestionnaireVersion> =
        questionnaireService.allVersions(kind)

    @MutationMapping
    fun saveQuestionnaireResponse(@Argument input: SaveQuestionnaireResponseInput): UserQuestionnaireResponse =
        questionnaireService.saveResponse(input)

    @MutationMapping
    fun submitQuestionnaireResponse(@Argument id: UUID): UserQuestionnaireResponse =
        questionnaireService.submitResponse(id)

    @MutationMapping
    fun saveQuestionnaireTemplate(@Argument input: SaveQuestionnaireTemplateInput): QuestionnaireVersion =
        questionnaireService.saveTemplate(input)
}
