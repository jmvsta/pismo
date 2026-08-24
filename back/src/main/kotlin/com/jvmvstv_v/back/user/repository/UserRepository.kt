package com.jvmvstv_v.back.user.repository

import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserCredentials
import java.util.UUID

interface UserRepository {
    fun findById(id: UUID): User?
    fun update(id: UUID, input: UpdateProfileInput): User
    fun create(input: RegisterInput, passwordHash: String): User
    fun existsByEmailOrNickname(email: String, nickname: String): Boolean
    fun findCredentialsByEmail(email: String): UserCredentials?
}
