package com.jvmvstv_v.back.forum.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.forum.repository.ForumRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ForumServiceImpl(private val forumRepository: ForumRepository) : ForumService {
    override fun topics(): List<ForumTopic> = forumRepository.findTopics()

    override fun posts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost> =
        forumRepository.findPosts(topicId, limit, offset)

    override fun post(id: UUID): ForumPost? = forumRepository.findPostById(id)

    override fun createPost(input: CreateForumPostInput): ForumPost =
        forumRepository.createPost(CurrentUser.id, input)

    override fun createReply(input: CreateForumReplyInput): ForumReply =
        forumRepository.createReply(CurrentUser.id, input)

    override fun thankPost(postId: UUID): ForumPost = forumRepository.thankPost(postId, CurrentUser.id)

    override fun thankReply(replyId: UUID): ForumReply = forumRepository.thankReply(replyId, CurrentUser.id)
}
