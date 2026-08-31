package com.jvmvstv_v.back.security

import com.jvmvstv_v.back.common.CurrentUser
import graphql.ExecutionResultImpl
import graphql.GraphqlErrorBuilder
import graphql.language.Field
import graphql.language.OperationDefinition
import graphql.parser.Parser
import org.springframework.beans.factory.annotation.Value
import org.springframework.graphql.execution.ErrorType
import org.springframework.graphql.server.WebGraphQlInterceptor
import org.springframework.graphql.server.WebGraphQlRequest
import org.springframework.graphql.server.WebGraphQlResponse
import org.springframework.graphql.support.DefaultExecutionGraphQlResponse
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

private val PUBLIC_FIELDS = setOf(
    "login", "register", "__schema", "__type", "__typename",
    "forumTopics", "forumPosts", "forumPost",
)

private val ALLOWED_WHILE_UNVERIFIED = setOf("confirmEmail", "resendVerificationCode", "logout", "me")

@Component
class AuthorizationInterceptor(
    @Value("\${app.email-verification.enforced:true}") private val emailVerificationEnforced: Boolean,
) : WebGraphQlInterceptor {
    override fun intercept(request: WebGraphQlRequest, chain: WebGraphQlInterceptor.Chain): Mono<WebGraphQlResponse> {
        val fields = topLevelFields(request.document)
        val requiresAuth = fields.any { it !in PUBLIC_FIELDS }
        if (requiresAuth && CurrentUser.idOrNull == null) {
            return unauthorized("You must be logged in", request)
        }
        if (requiresAuth && emailVerificationEnforced && CurrentUser.idOrNull != null && !CurrentUser.emailVerified) {
            val requiresVerification = fields.any { it !in PUBLIC_FIELDS && it !in ALLOWED_WHILE_UNVERIFIED }
            if (requiresVerification) {
                return unauthorized("Please verify your email before continuing", request)
            }
        }
        return chain.next(request)
    }

    private fun unauthorized(message: String, request: WebGraphQlRequest): Mono<WebGraphQlResponse> {
        val error = GraphqlErrorBuilder.newError()
            .message(message)
            .errorType(ErrorType.UNAUTHORIZED)
            .build()
        val result = DefaultExecutionGraphQlResponse(request.toExecutionInput(), ExecutionResultImpl(error))
        return Mono.just(WebGraphQlResponse(result))
    }

    private fun topLevelFields(document: String): Set<String> = try {
        Parser().parseDocument(document).definitions
            .filterIsInstance<OperationDefinition>()
            .flatMap { it.selectionSet.selections }
            .filterIsInstance<Field>()
            .map { it.name }
            .toSet()
    } catch (ex: Exception) {
        emptySet()
    }
}
