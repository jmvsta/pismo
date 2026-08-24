package com.jvmvstv_v.back.user.service

import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

interface UserService {
    fun currentUser(): User?
    fun findById(id: UUID): User?
    fun updateProfile(input: UpdateProfileInput): User
}
