package com.jvmvstv_v.back.user.model

import java.util.UUID

enum class UserRole { USER, MODERATOR, ADMIN }

enum class UserStatus { ACTIVE, SUSPENDED, DELETED }

enum class OauthProvider { GOOGLE }

data class User(
    val id: UUID,
    val nickname: String,
    val email: String,
    val dateOfBirth: String?,
    val avatarUrl: String?,
    val bio: String?,
    val city: String?,
    val countryCode: String?,
    val role: UserRole,
    val status: UserStatus,
    val rulesAcceptedAt: String,
    val emailVerifiedAt: String?,
    val lastSeenAt: String?,
    val createdAt: String,
    val updatedAt: String,
    val oauthAccounts: List<UserOauthAccount>,
    val authToken: String? = null,
)

data class UserOauthAccount(
    val id: UUID,
    val provider: OauthProvider,
    val providerUserId: String,
    val email: String?,
    val linkedAt: String,
)

data class UpdateProfileInput(
    val nickname: String?,
    val avatarUrl: String?,
    val bio: String?,
    val city: String?,
    val countryCode: String?,
)

data class RegisterInput(
    val nickname: String,
    val email: String,
    val password: String,
    val dateOfBirth: String?,
    val acceptedRules: Boolean,
)

data class LoginInput(
    val email: String,
    val password: String,
)

data class UserCredentials(
    val id: UUID,
    val passwordHash: String?,
)
