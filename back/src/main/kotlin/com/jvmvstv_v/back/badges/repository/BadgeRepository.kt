package com.jvmvstv_v.back.badges.repository

import com.jvmvstv_v.back.badges.model.Badge
import com.jvmvstv_v.back.badges.model.UserBadge
import java.util.UUID

interface BadgeRepository {
    fun findAll(): List<Badge>
    fun findForUser(userId: UUID): List<UserBadge>
}
