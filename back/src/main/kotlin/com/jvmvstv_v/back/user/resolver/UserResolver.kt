package com.jvmvstv_v.back.user.resolver

import com.jvmvstv_v.back.user.model.UpdateProfileInput
import com.jvmvstv_v.back.user.model.User
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
}
