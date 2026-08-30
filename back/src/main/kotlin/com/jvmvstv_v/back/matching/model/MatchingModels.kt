package com.jvmvstv_v.back.matching.model

import com.jvmvstv_v.back.user.model.User
import java.util.UUID

enum class PenPalRequestStatus { PENDING, ACCEPTED, DECLINED, CANCELLED }

data class UserMatch(
    val userA: User,
    val userB: User,
    val score: Double,
    val sharedInterests: List<String>,
    val computedAt: String,
)

data class SuggestedProfile(
    val user: User,
    val score: Double?,
    val sharedInterests: List<String>,
    val hasIncomingRequest: Boolean,
)

data class PenPalRequest(
    val id: UUID,
    val requester: User,
    val addressee: User,
    val status: PenPalRequestStatus,
    val message: String?,
    val createdAt: String,
    val respondedAt: String?,
)

data class PenPalConnection(
    val id: UUID,
    val userA: User,
    val userB: User,
    val request: PenPalRequest?,
    val establishedAt: String,
    val endedAt: String?,
    val endedBy: User?,
)
