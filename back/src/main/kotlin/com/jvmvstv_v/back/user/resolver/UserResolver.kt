package com.jvmvstv_v.back.user.resolver

import com.jvmvstv_v.back.user.model.LoginInput
import com.jvmvstv_v.back.user.model.RegisterInput
import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
import com.jvmvstv_v.back.user.model.UserRole
import com.jvmvstv_v.back.user.model.UserStatus
import com.jvmvstv_v.back.user.service.UserService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class UserResolver(private val userService: UserService) {
    @QueryMapping
    fun me(): User? = userService.currentUser()

    @QueryMapping
    fun user(@Argument id: UUID): User? = userService.findById(id)

    @MutationMapping
    fun updateProfile(@Argument input: UpdateProfileInput): User = userService.updateProfile(input)

    @MutationMapping
    fun updateAvatar(@Argument mimeType: String, @Argument imageBase64: String): User =
        userService.replaceAvatar(mimeType, imageBase64)

    @MutationMapping
    fun register(@Argument input: RegisterInput): User = userService.register(input)

    @MutationMapping
    fun login(@Argument input: LoginInput): User = userService.login(input)

    @MutationMapping
    fun logout(): Boolean {
        userService.logout()
        return true
    }

    @QueryMapping
    fun users(): List<User> = userService.listUsers()

    @MutationMapping
    fun setUserStatus(@Argument userId: UUID, @Argument status: UserStatus): User =
        userService.setUserStatus(userId, status)

    @MutationMapping
    fun setUserRole(@Argument userId: UUID, @Argument role: UserRole): User =
        userService.setUserRole(userId, role)
}
