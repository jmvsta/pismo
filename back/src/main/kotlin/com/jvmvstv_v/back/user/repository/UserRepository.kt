package com.jvmvstv_v.back.user.repository

import com.jvmvstv_v.back.common.AuthenticatedPrincipal
import com.jvmvstv_v.back.user.model.OauthProvider
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserCredentials
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.model.UserStatus
import java.time.OffsetDateTime
import java.util.UUID

interface UserRepository {
    fun findById(id: UUID): User?
    fun findAll(): List<User>
    fun update(id: UUID, input: UpdateProfileInput): User
    fun create(input: RegisterInput, passwordHash: String): User
    fun existsByEmailOrNickname(email: String, nickname: String): Boolean
    fun findCredentialsByEmail(email: String): UserCredentials?
    fun setAuthToken(userId: UUID, token: String, expiresAt: OffsetDateTime)
    fun clearAuthToken(userId: UUID)
    fun findActiveUserByToken(token: String): AuthenticatedPrincipal?
    fun setStatus(userId: UUID, status: UserStatus): User
    fun setRole(userId: UUID, role: UserRole): User
    fun findUserIdByOauthAccount(provider: OauthProvider, providerUserId: String): UUID?
    fun linkOauthAccount(userId: UUID, provider: OauthProvider, providerUserId: String, email: String?)
    fun createOauthUser(nickname: String, email: String, provider: OauthProvider, providerUserId: String): User
}
