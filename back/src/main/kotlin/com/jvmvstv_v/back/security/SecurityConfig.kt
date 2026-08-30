package com.jvmvstv_v.back.security

import com.jvmvstv_v.back.user.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(
    @Value("\${app.cors.allowed-origins}") private val allowedOrigins: List<String>,
    private val userRepository: UserRepository,
) {
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = this@SecurityConfig.allowedOrigins
            allowedMethods = listOf("GET", "POST", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", configuration)
        }
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    // Google's login is a real browser navigation that round-trips through Google and back
    // (not fetch/XHR), so it needs the session Spring's OAuth2 client uses to hold the
    // authorization request/state between those two hops -- unlike everything else in this
    // app, which is stateless bearer-token auth. Scoped narrowly and given priority (@Order 1)
    // so it doesn't affect the stateless chain below. Only registered where a google client
    // registration actually exists (application-prod.yaml); local dev keeps using
    // password register/login.
    //
    // oauthLoginSuccessHandler is a @Bean *method* parameter, not a constructor dependency of
    // this class -- it transitively needs UserServiceImpl -> PasswordEncoder, and PasswordEncoder
    // is a @Bean defined right here in SecurityConfig. Injecting it via the constructor would
    // make SecurityConfig depend on a bean that can't be created until SecurityConfig already
    // exists. Spring resolves @Bean method parameters lazily when the method runs, which breaks
    // that cycle without changing anything else.
    @Bean
    @Order(1)
    @Profile("!local")
    fun oauth2LoginFilterChain(http: HttpSecurity, oauthLoginSuccessHandler: OauthLoginSuccessHandler): SecurityFilterChain {
        http {
            securityMatcher("/oauth2/**", "/login/oauth2/**")
            csrf { disable() }
            authorizeHttpRequests {
                authorize(anyRequest, permitAll)
            }
            oauth2Login {
                authenticationSuccessHandler = oauthLoginSuccessHandler
                authenticationFailureHandler = SimpleUrlAuthenticationFailureHandler("/login?error=oauth")
            }
        }
        return http.build()
    }

    @Bean
    @Order(2)
    @Profile("local")
    fun localSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            cors { }
            csrf { disable() }
            sessionManagement { sessionCreationPolicy = SessionCreationPolicy.STATELESS }
            authorizeHttpRequests {
                authorize(anyRequest, permitAll)
            }
            addFilterBefore<UsernamePasswordAuthenticationFilter>(
                BearerTokenAuthenticationFilter(userRepository),
            )
        }
        return http.build()
    }

    // Auth here is a Bearer token over the Authorization header, never an ambient cookie,
    // so there is no session for CSRF to protect. GraphQL multiplexes public ops
    // (login/register) and protected ones over one endpoint, which the HTTP layer can't
    // tell apart -- that's AuthorizationInterceptor's job, at the GraphQL field level.
    // This chain just has to get every request that far unmolested.
    @Bean
    @Order(2)
    @Profile("!local")
    fun secureSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            cors { }
            csrf { disable() }
            sessionManagement { sessionCreationPolicy = SessionCreationPolicy.STATELESS }
            authorizeHttpRequests {
                authorize(anyRequest, permitAll)
            }
            addFilterBefore<UsernamePasswordAuthenticationFilter>(
                BearerTokenAuthenticationFilter(userRepository),
            )
            headers {
                frameOptions { deny = true }
            }
        }
        return http.build()
    }
}
