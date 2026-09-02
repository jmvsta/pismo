package com.jvmvstv_v.back.badges.repository

import com.jvmvstv_v.back.badges.model.LetterRankBadge
import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import java.util.UUID

interface LetterRankBadgeRepository {
    fun findAll(): List<LetterRankBadge>
    fun findForUser(userId: UUID): List<UserLetterRankBadge>
    fun findQualifying(letterCount: Int): List<LetterRankBadge>
    fun award(userId: UUID, badgeId: Int)
}
