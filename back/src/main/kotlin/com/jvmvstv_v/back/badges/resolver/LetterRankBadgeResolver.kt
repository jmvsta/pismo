package com.jvmvstv_v.back.badges.resolver

import com.jvmvstv_v.back.badges.model.LetterRankBadge
import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import com.jvmvstv_v.back.badges.service.LetterRankBadgeService
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class LetterRankBadgeResolver(private val letterRankBadgeService: LetterRankBadgeService) {
    @QueryMapping
    fun letterRankBadges(): List<LetterRankBadge> = letterRankBadgeService.allBadges()

    @QueryMapping
    fun myLetterRankBadges(): List<UserLetterRankBadge> = letterRankBadgeService.myBadges()
}
