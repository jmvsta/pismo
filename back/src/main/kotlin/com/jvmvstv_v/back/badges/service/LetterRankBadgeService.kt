package com.jvmvstv_v.back.badges.service

import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import com.jvmvstv_v.back.badges.model.LetterRankBadge
import java.util.UUID

interface LetterRankBadgeService {
    fun allBadges(): List<LetterRankBadge>
    fun myBadges(): List<UserLetterRankBadge>
    fun awardForLetterCount(userId: UUID, sentLetterCount: Int)
}
