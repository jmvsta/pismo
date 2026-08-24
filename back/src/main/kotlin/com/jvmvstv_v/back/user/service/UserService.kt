package com.jvmvstv_v.back.user.service

import com.jvmvstv_v.back.user.model.LoginInput
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

interface UserService {
    fun currentUser(): User?
    fun findById(id: UUID): User?
    fun updateProfile(input: UpdateProfileInput): User
    fun register(input: RegisterInput): User
    fun login(input: LoginInput): User
    fun logout()
}
