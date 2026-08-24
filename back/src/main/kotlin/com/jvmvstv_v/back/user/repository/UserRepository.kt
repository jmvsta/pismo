package com.jvmvstv_v.back.user.repository

import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

interface UserRepository {
    fun findById(id: UUID): User?
    fun update(id: UUID, input: UpdateProfileInput): User
}
