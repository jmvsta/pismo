package com.jvmvstv_v.back.common

import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter
import org.springframework.graphql.execution.ErrorType
import org.springframework.stereotype.Component

@Component
class GraphQlExceptionResolver : DataFetcherExceptionResolverAdapter() {
    override fun resolveToSingleError(ex: Throwable, env: DataFetchingEnvironment): GraphQLError? =
        if (ex is AuthException) {
            GraphqlErrorBuilder.newError(env)
                .message(ex.message)
                .errorType(ErrorType.BAD_REQUEST)
                .build()
        } else {
            null
        }
}
