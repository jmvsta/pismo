package com.jvmvstv_v.back.common

import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import org.slf4j.LoggerFactory
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter
import org.springframework.graphql.execution.ErrorType
import org.springframework.stereotype.Component

@Component
class GraphQlExceptionResolver : DataFetcherExceptionResolverAdapter() {
    private val logger = LoggerFactory.getLogger(GraphQlExceptionResolver::class.java)

    override fun resolveToSingleError(ex: Throwable, env: DataFetchingEnvironment): GraphQLError? =
        if (ex is AuthException) {
            logger.info("Rejected {}: {}", env.field.name, ex.message)
            GraphqlErrorBuilder.newError(env)
                .message(ex.message)
                .errorType(ErrorType.BAD_REQUEST)
                .build()
        } else {
            null
        }
}
