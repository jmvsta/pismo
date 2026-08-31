package com.jvmvstv_v.back.user.email

interface EmailGateway {
    fun sendVerificationCode(email: String, code: String)
}
