package com.jvmvstv_v.back.user.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.common.SessionAuthenticator
import com.jvmvstv_v.back.user.model.LoginInput
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val sessionAuthenticator: SessionAuthenticator,
) : UserService {
    override fun currentUser(): User? = CurrentUser.idOrNull?.let { userRepository.findById(it) }

    override fun findById(id: UUID): User? = userRepository.findById(id)

    override fun updateProfile(input: UpdateProfileInput): User =
        userRepository.update(CurrentUser.id, input)

    override fun register(input: RegisterInput): User {
        validateRegistration(input)
        val passwordHash = passwordEncoder.encode(input.password) ?: error("Password hashing failed")
        val user = userRepository.create(input, passwordHash)
        sessionAuthenticator.authenticate(user.id, user.email)
        return user
    }

    override fun login(input: LoginInput): User {
        val credentials = userRepository.findCredentialsByEmail(input.email)
            ?: throw AuthException("Invalid email or password")
        val passwordHash = credentials.passwordHash
        if (passwordHash == null || !passwordEncoder.matches(input.password, passwordHash)) {
            throw AuthException("Invalid email or password")
        }
        val user = userRepository.findById(credentials.id) ?: error("User ${credentials.id} not found")
        sessionAuthenticator.authenticate(user.id, user.email)
        return user
    }

    override fun logout() = sessionAuthenticator.clear()

    private fun validateRegistration(input: RegisterInput) {
        if (!input.acceptedRules) throw AuthException("You must accept the community rules")
        if (input.password.length < 8) throw AuthException("Password must be at least 8 characters")
        if (userRepository.existsByEmailOrNickname(input.email, input.nickname)) {
            throw AuthException("Email or nickname is already taken")
        }
    }
}
