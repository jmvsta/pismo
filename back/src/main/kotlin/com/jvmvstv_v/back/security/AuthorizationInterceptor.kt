package com.jvmvstv_v.back.security

import com.jvmvstv_v.back.common.CurrentUser
import graphql.ExecutionResultImpl
import graphql.GraphqlErrorBuilder
import graphql.language.Field
import graphql.language.OperationDefinition
import graphql.parser.Parser
import org.springframework.context.annotation.Profile
import org.springframework.graphql.execution.ErrorType
import org.springframework.graphql.server.WebGraphQlInterceptor
import org.springframework.graphql.server.WebGraphQlRequest
import org.springframework.graphql.server.WebGraphQlResponse
import org.springframework.graphql.support.DefaultExecutionGraphQlResponse
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

private val PUBLIC_FIELDS = setOf("login", "register", "__schema", "__type", "__typename")

@Component
@Profile("local")
class AuthorizationInterceptor : WebGraphQlInterceptor {
    override fun intercept(request: WebGraphQlRequest, chain: WebGraphQlInterceptor.Chain): Mono<WebGraphQlResponse> {
        val fields = topLevelFields(request.document)
        val requiresAuth = fields.any { it !in PUBLIC_FIELDS }
        if (requiresAuth && CurrentUser.idOrNull == null) {
            val error = GraphqlErrorBuilder.newError()
                .message("You must be logged in")
                .errorType(ErrorType.UNAUTHORIZED)
                .build()
            val result = DefaultExecutionGraphQlResponse(request.toExecutionInput(), ExecutionResultImpl(error))
            return Mono.just(WebGraphQlResponse(result))
        }
        return chain.next(request)
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
