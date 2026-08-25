package com.jvmvstv_v.back.forum.service

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.CreateForumTopicInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.forum.model.UpdateForumPostInput
import java.util.UUID

interface ForumService {
    fun topics(): List<ForumTopic>
    fun createTopic(input: CreateForumTopicInput): ForumTopic
    fun posts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost>
    fun post(id: UUID): ForumPost?
    fun createPost(input: CreateForumPostInput): ForumPost
    fun createReply(input: CreateForumReplyInput): ForumReply
    fun updatePost(id: UUID, input: UpdateForumPostInput): ForumPost
    fun updateReply(id: UUID, body: String): ForumReply
    fun thankPost(postId: UUID): ForumPost
    fun thankReply(replyId: UUID): ForumReply
    fun setTopicActive(topicId: Int, active: Boolean): ForumTopic
    fun deleteTopic(topicId: Int)
}
