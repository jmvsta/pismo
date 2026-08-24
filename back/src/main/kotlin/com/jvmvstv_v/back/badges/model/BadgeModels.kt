package com.jvmvstv_v.back.badges.model

import com.jvmvstv_v.back.user.model.User

data class Badge(
    val id: Int,
    val code: String,
    val title: String,
    val description: String?,
    val iconUrl: String?,
    val position: Int,
    val active: Boolean,
)

data class UserBadge(
    val user: User,
    val badge: Badge,
    val awardedAt: String,
)
