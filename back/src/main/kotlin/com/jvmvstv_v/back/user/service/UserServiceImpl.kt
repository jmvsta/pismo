package com.jvmvstv_v.back.user.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.common.SecureTokenGenerator
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import com.jvmvstv_v.back.matching.service.MatchingService
import com.jvmvstv_v.back.user.model.LoginInput
import com.jvmvstv_v.back.user.model.OauthProvider
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.model.UserStatus
import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID
import kotlin.random.Random

private val TOKEN_LIFETIME: Duration = Duration.ofHours(1)

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val imageService: ImageService,
    private val matchingService: MatchingService,
) : UserService {
    override fun currentUser(): User? = CurrentUser.idOrNull?.let { userRepository.findById(it) }

    // The only caller is the user(id) query, which is how a matching-feed card links out to
    // a full profile page -- so it has to respect the same pre-match privacy rule the feed
    // itself applies, or that card would leak the photo/bio it just redacted.
    override fun findById(id: UUID): User? = userRepository.findById(id)?.let { matchingService.redactUnlessMatched(it) }

    override fun updateProfile(input: UpdateProfileInput): User =
        userRepository.update(CurrentUser.id, input)

    override fun replaceAvatar(mimeType: String, imageBase64: String): User {
        val userId = CurrentUser.id
        val previousAvatarImageId = userRepository.findById(userId)?.avatarImageId
        val image = imageService.store(ImageOwnerType.USER_AVATAR, userId, mimeType, imageBase64)
        val updated = userRepository.setAvatarImage(userId, image.id)
        previousAvatarImageId?.let { imageService.delete(it) }
        return updated
    }

    override fun register(input: RegisterInput): User {
        validateRegistration(input)
        val passwordHash = passwordEncoder.encode(input.password) ?: error("Password hashing failed")
        val user = userRepository.create(input, passwordHash)
        return user.copy(authToken = issueToken(user.id))
    }

    override fun login(input: LoginInput): User {
        val credentials = userRepository.findCredentialsByEmail(input.email)
            ?: throw AuthException("Invalid email or password")
        val passwordHash = credentials.passwordHash
        if (passwordHash == null || !passwordEncoder.matches(input.password, passwordHash)) {
            throw AuthException("Invalid email or password")
        }
        val user = userRepository.findById(credentials.id) ?: error("User ${credentials.id} not found")
        return user.copy(authToken = issueToken(user.id))
    }

    // Three cases: this Google account has signed in before (linked already), this email
    // already has a password account (link Google to it), or neither (create a fresh user).
    // Either way the caller gets back the same shape register()/login() return -- a bearer
    // token, not a Google token. Rules acceptance is implicit here: there's no separate
    // "accept the rules" step in the OAuth flow the way there is on the register form.
    override fun loginWithOauth(
        provider: OauthProvider,
        providerUserId: String,
        email: String,
        suggestedNickname: String?,
    ): User {
        val linkedUserId = userRepository.findUserIdByOauthAccount(provider, providerUserId)
        val userId = when {
            linkedUserId != null -> linkedUserId
            else -> {
                val existingId = userRepository.findCredentialsByEmail(email)?.id
                if (existingId != null) {
                    userRepository.linkOauthAccount(existingId, provider, providerUserId, email)
                    existingId
                } else {
                    val created = userRepository.createOauthUser(
                        nickname = uniqueNickname(email, suggestedNickname),
                        email = email,
                        provider = provider,
                        providerUserId = providerUserId,
                    )
                    return created.copy(authToken = issueToken(created.id))
                }
            }
        }
        val user = userRepository.findById(userId) ?: error("User $userId not found")
        return user.copy(authToken = issueToken(user.id))
    }

    override fun logout() = userRepository.clearAuthToken(CurrentUser.id)

    override fun listUsers(): List<User> {
        CurrentUser.requireAdmin()
        return userRepository.findAll()
    }

    override fun setUserStatus(userId: UUID, status: UserStatus): User {
        CurrentUser.requireAdmin()
        return userRepository.setStatus(userId, status)
    }

    override fun setUserRole(userId: UUID, role: UserRole): User {
        CurrentUser.requireAdmin()
        return userRepository.setRole(userId, role)
    }

    private fun issueToken(userId: UUID): String {
        val token = SecureTokenGenerator.generate()
        userRepository.setAuthToken(userId, token, OffsetDateTime.now().plus(TOKEN_LIFETIME))
        return token
    }

    private fun uniqueNickname(email: String, suggested: String?): String {
        val base = (suggested?.takeIf { it.isNotBlank() } ?: email.substringBefore('@'))
            .lowercase()
            .replace(Regex("[^a-z0-9._-]"), "")
            .let { if (it.length < 3) it.padEnd(3, '0') else it }
            .take(40)
        var candidate = base
        var attempt = 0
        while (userRepository.existsByEmailOrNickname(email, candidate)) {
            attempt++
            if (attempt > 10) error("Could not generate a unique nickname for $email")
            candidate = "$base${Random.nextInt(1000, 9999)}".take(50)
        }
        return candidate
    }

    private fun validateRegistration(input: RegisterInput) {
        if (!input.acceptedRules) throw AuthException("You must accept the community rules")
        if (input.password.length < 8) throw AuthException("Password must be at least 8 characters")
        if (userRepository.existsByEmailOrNickname(input.email, input.nickname)) {
            throw AuthException("Email or nickname is already taken")
        }
    }
}
