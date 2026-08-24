package com.jvmvstv_v.back.badges.service

import com.jvmvstv_v.back.badges.model.Badge
import com.jvmvstv_v.back.badges.model.UserBadge
import com.jvmvstv_v.back.badges.repository.BadgeRepository
import com.jvmvstv_v.back.common.CurrentUser
import org.springframework.stereotype.Service

@Service
class BadgeServiceImpl(private val badgeRepository: BadgeRepository) : BadgeService {
    override fun allBadges(): List<Badge> = badgeRepository.findAll()

    override fun myBadges(): List<UserBadge> = badgeRepository.findForUser(CurrentUser.id)
}
