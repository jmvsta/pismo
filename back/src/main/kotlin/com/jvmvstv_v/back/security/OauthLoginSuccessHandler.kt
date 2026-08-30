package com.jvmvstv_v.back.security

import com.jvmvstv_v.back.user.model.OauthProvider
import com.jvmvstv_v.back.user.service.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component

// Runs once Google has confirmed the user's identity. From here on this is just another
// path to the same place register()/login() land: find-or-create the local user, issue our
// own bearer token, hand it to the frontend. The frontend never sees a Google token.
@Component
class OauthLoginSuccessHandler(
    private val userService: UserService,
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val oidcUser = authentication.principal as OidcUser
        val email = oidcUser.email ?: error("Google account has no email")
        val user = userService.loginWithOauth(
            provider = OauthProvider.GOOGLE,
            providerUserId = oidcUser.subject,
            email = email,
            suggestedNickname = oidcUser.givenName ?: oidcUser.fullName,
        )
        response.sendRedirect("/oauth-callback?token=${user.authToken}")
    }
}
