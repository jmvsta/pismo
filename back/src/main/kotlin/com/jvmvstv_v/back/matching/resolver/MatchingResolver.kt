package com.jvmvstv_v.back.matching.resolver

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.matching.model.PenPalRequest
import com.jvmvstv_v.back.matching.model.PenPalRequestStatus
import com.jvmvstv_v.back.matching.model.UserMatch
import com.jvmvstv_v.back.matching.service.MatchingService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class MatchingResolver(private val matchingService: MatchingService) {
    @QueryMapping
    fun myMatches(@Argument limit: Int?): List<UserMatch> = matchingService.myMatches(limit)

    @QueryMapping
    fun penPalRequests(@Argument status: PenPalRequestStatus?): List<PenPalRequest> =
        matchingService.penPalRequests(status)

    @QueryMapping
    fun myConnections(): List<PenPalConnection> = matchingService.myConnections()

    @MutationMapping
    fun sendPenPalRequest(@Argument addresseeId: UUID, @Argument message: String?): PenPalRequest =
        matchingService.sendPenPalRequest(addresseeId, message)

    @MutationMapping
    fun respondToPenPalRequest(@Argument id: UUID, @Argument accept: Boolean): PenPalRequest =
        matchingService.respondToPenPalRequest(id, accept)

    @MutationMapping
    fun cancelPenPalRequest(@Argument id: UUID): PenPalRequest = matchingService.cancelPenPalRequest(id)

    @MutationMapping
    fun endConnection(@Argument id: UUID): PenPalConnection = matchingService.endConnection(id)
}
