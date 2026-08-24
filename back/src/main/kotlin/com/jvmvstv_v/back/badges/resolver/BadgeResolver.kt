package com.jvmvstv_v.back.badges.resolver

import com.jvmvstv_v.back.badges.model.Badge
import com.jvmvstv_v.back.badges.model.UserBadge
import com.jvmvstv_v.back.badges.service.BadgeService
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class BadgeResolver(private val badgeService: BadgeService) {
    @QueryMapping
    fun badges(): List<Badge> = badgeService.allBadges()

    @QueryMapping
    fun myBadges(): List<UserBadge> = badgeService.myBadges()
}
