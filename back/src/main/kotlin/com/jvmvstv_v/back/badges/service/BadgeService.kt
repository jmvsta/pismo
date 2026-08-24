package com.jvmvstv_v.back.badges.service

import com.jvmvstv_v.back.badges.model.Badge
import com.jvmvstv_v.back.badges.model.UserBadge

interface BadgeService {
    fun allBadges(): List<Badge>
    fun myBadges(): List<UserBadge>
}
