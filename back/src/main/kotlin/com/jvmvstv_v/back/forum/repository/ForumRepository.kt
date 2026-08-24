package com.jvmvstv_v.back.forum.repository

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import java.util.UUID

interface ForumRepository {
    fun findTopics(): List<ForumTopic>
    fun findPosts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost>
    fun findPostById(id: UUID): ForumPost?
    fun createPost(authorId: UUID, input: CreateForumPostInput): ForumPost
    fun createReply(authorId: UUID, input: CreateForumReplyInput): ForumReply
    fun thankPost(postId: UUID, userId: UUID): ForumPost
    fun thankReply(replyId: UUID, userId: UUID): ForumReply
}
