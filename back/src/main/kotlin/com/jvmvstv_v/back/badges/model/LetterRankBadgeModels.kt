package com.jvmvstv_v.back.badges.model

import com.jvmvstv_v.back.user.model.User

data class LetterRankBadge(
    val id: Int,
    val code: String,
    val title: String,
    val minLetters: Int,
    val maxLetters: Int?,
    val iconUrl: String?,
    val position: Int,
)

data class UserLetterRankBadge(
    val user: User,
    val badge: LetterRankBadge,
    val awardedAt: String,
)
