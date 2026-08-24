package com.jvmvstv_v.back.language.model

import com.jvmvstv_v.back.user.model.User

enum class LanguagePurpose { WRITE, RECEIVE, LEARNING }

enum class LanguageProficiency { BEGINNER, INTERMEDIATE, ADVANCED, NATIVE }

data class Language(
    val code: String,
    val name: String,
    val nativeName: String,
    val position: Int,
    val active: Boolean,
)

data class UserLanguage(
    val user: User,
    val language: Language,
    val purpose: LanguagePurpose,
    val proficiency: LanguageProficiency?,
    val createdAt: String,
)
