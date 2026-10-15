package com.jvmvstv_v.back.common.logging

import com.jvmvstv_v.back.common.CurrentUser
import graphql.language.Field
import graphql.language.OperationDefinition
import graphql.parser.Parser
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.graphql.ResponseError
import org.springframework.graphql.execution.ErrorType
import org.springframework.graphql.server.WebGraphQlInterceptor
import org.springframework.graphql.server.WebGraphQlRequest
import org.springframework.graphql.server.WebGraphQlResponse
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

private val CLIENT_ERROR_TYPES = setOf(ErrorType.BAD_REQUEST, ErrorType.UNAUTHORIZED, ErrorType.FORBIDDEN, ErrorType.NOT_FOUND)

// One line per GraphQL operation: what was asked, by whom, how it ended and how long it took.
// Mutations are INFO (they are the audit trail); queries are DEBUG because the app polls some of
// them. Variables are never logged -- they carry passwords, tokens and base64 images.
// Registered first so it also sees the rejections made by AuthorizationInterceptor.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class GraphQlLoggingInterceptor : WebGraphQlInterceptor {
    private val logger = LoggerFactory.getLogger(GraphQlLoggingInterceptor::class.java)

    override fun intercept(request: WebGraphQlRequest, chain: WebGraphQlInterceptor.Chain): Mono<WebGraphQlResponse> {
        val operation = describe(request.document)
        val user = CurrentUser.idOrNull?.toString() ?: "anonymous"
        val startedAt = System.nanoTime()
        return chain.next(request)
            .doOnNext { response -> logOutcome(operation, user, tookMs(startedAt), response) }
            .doOnError { ex ->
                logger.warn("GraphQL {} user={} crashed after {}ms", operation.summary, user, tookMs(startedAt), ex)
            }
    }

    private fun logOutcome(operation: Operation, user: String, tookMs: Long, response: WebGraphQlResponse) {
        val errors = response.errors
        if (errors.isEmpty()) {
            if (operation.isMutation) {
                logger.info("GraphQL {} user={} ok in {}ms", operation.summary, user, tookMs)
            } else {
                logger.debug("GraphQL {} user={} ok in {}ms", operation.summary, user, tookMs)
            }
            return
        }
        val executionId = response.executionInput.executionId
        val summary = errors.joinToString("; ") { "${classification(it)}: ${it.message}" }
        if (errors.all { classification(it) in CLIENT_ERROR_TYPES.map(ErrorType::name) }) {
            logger.info("GraphQL {} user={} rejected in {}ms: {} (executionId={})", operation.summary, user, tookMs, summary, executionId)
        } else {
            logger.warn("GraphQL {} user={} FAILED in {}ms: {} (executionId={})", operation.summary, user, tookMs, summary, executionId)
        }
    }

    private fun classification(error: ResponseError): String =
        error.errorType?.toString() ?: error.extensions["classification"]?.toString() ?: "UNKNOWN"

    private fun tookMs(startedAt: Long): Long = (System.nanoTime() - startedAt) / 1_000_000

    private fun describe(document: String): Operation = try {
        val definition = Parser().parseDocument(document).definitions
            .filterIsInstance<OperationDefinition>()
            .firstOrNull()
        val kind = definition?.operation ?: OperationDefinition.Operation.QUERY
        val fields = definition?.selectionSet?.selections?.filterIsInstance<Field>()?.map { it.name }.orEmpty()
        Operation(
            summary = "${kind.name.lowercase()} ${fields.joinToString(",").ifEmpty { definition?.name ?: "?" }}",
            isMutation = kind == OperationDefinition.Operation.MUTATION,
        )
    } catch (ex: Exception) {
        Operation(summary = "unparseable", isMutation = false)
    }

    private data class Operation(val summary: String, val isMutation: Boolean)
}
