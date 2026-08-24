package com.jvmvstv_v.back.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(
    @Value("\${app.cors.allowed-origins}") private val allowedOrigins: List<String>,
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
    @Profile("local")
    fun localSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            cors { }
            csrf { disable() }
            authorizeHttpRequests {
                authorize(anyRequest, permitAll)
            }
        }
        return http.build()
    }

    @Bean
    @Profile("!local")
    fun secureSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        val requestHandler = CsrfTokenRequestAttributeHandler()
        http {
            cors { }
            csrf {
                csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse()
                csrfTokenRequestHandler = requestHandler
            }
            authorizeHttpRequests {
                authorize("/actuator/health", permitAll)
                authorize(anyRequest, authenticated)
            }
            oauth2Login { }
            headers {
                frameOptions { deny = true }
            }
        }
        return http.build()
    }
}
