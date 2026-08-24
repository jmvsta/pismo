package com.jvmvstv_v.back.user.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserServiceImpl(private val userRepository: UserRepository) : UserService {
    override fun currentUser(): User? = userRepository.findById(CurrentUser.id)

    override fun findById(id: UUID): User? = userRepository.findById(id)

    override fun updateProfile(input: UpdateProfileInput): User =
        userRepository.update(CurrentUser.id, input)
}
