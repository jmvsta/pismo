package com.jvmvstv_v.back.badges.service

import com.jvmvstv_v.back.badges.model.LetterRankBadge
import com.jvmvstv_v.back.badges.model.UserLetterRankBadge
import com.jvmvstv_v.back.badges.repository.LetterRankBadgeRepository
import com.jvmvstv_v.back.common.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class LetterRankBadgeServiceImpl(
    private val letterRankBadgeRepository: LetterRankBadgeRepository,
) : LetterRankBadgeService {
    private val logger = LoggerFactory.getLogger(LetterRankBadgeServiceImpl::class.java)

    override fun allBadges(): List<LetterRankBadge> = letterRankBadgeRepository.findAll()

    override fun myBadges(): List<UserLetterRankBadge> = letterRankBadgeRepository.findForUser(CurrentUser.id)

    override fun awardForLetterCount(userId: UUID, sentLetterCount: Int) {
        val qualifying = letterRankBadgeRepository.findQualifying(sentLetterCount)
        qualifying.forEach { badge -> letterRankBadgeRepository.award(userId, badge.id) }
        logger.debug("User {} has sent {} letter(s) and qualifies for {} rank badge(s)", userId, sentLetterCount, qualifying.size)
    }
}
