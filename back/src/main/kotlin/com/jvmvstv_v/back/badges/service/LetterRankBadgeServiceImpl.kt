package com.jvmvstv_v.back.badges.service

import com.jvmvstv_v.back.badges.model.LetterRankBadge
import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import com.jvmvstv_v.back.badges.repository.LetterRankBadgeRepository
import com.jvmvstv_v.back.common.CurrentUser
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class LetterRankBadgeServiceImpl(
    private val letterRankBadgeRepository: LetterRankBadgeRepository,
) : LetterRankBadgeService {
    override fun allBadges(): List<LetterRankBadge> = letterRankBadgeRepository.findAll()

    override fun myBadges(): List<UserLetterRankBadge> = letterRankBadgeRepository.findForUser(CurrentUser.id)

    override fun awardForLetterCount(userId: UUID, sentLetterCount: Int) {
        letterRankBadgeRepository.findQualifying(sentLetterCount).forEach { badge ->
            letterRankBadgeRepository.award(userId, badge.id)
        }
    }
}
