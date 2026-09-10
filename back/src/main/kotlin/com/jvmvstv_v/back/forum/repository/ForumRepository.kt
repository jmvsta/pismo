package com.jvmvstv_v.back.forum.repository

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.CreateForumTopicInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.forum.model.NewForumPostPhoto
import com.jvmvstv_v.back.forum.model.NewForumReplyPhoto
import com.jvmvstv_v.back.forum.model.UpdateForumPostInput
import java.util.UUID

interface ForumRepository {
    fun findTopics(): List<ForumTopic>
    fun findTopicById(id: Int): ForumTopic?
    fun createTopic(input: CreateForumTopicInput): ForumTopic
    fun findPosts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost>
    fun findPostById(id: UUID): ForumPost?
    fun findReplyById(id: UUID): ForumReply?
    fun createPost(authorId: UUID, input: CreateForumPostInput, photos: List<NewForumPostPhoto>): ForumPost
    fun createReply(authorId: UUID, input: CreateForumReplyInput, photos: List<NewForumReplyPhoto>): ForumReply
    fun updatePost(id: UUID, input: UpdateForumPostInput): ForumPost
    fun updateReply(id: UUID, body: String): ForumReply
    fun thankPost(postId: UUID, userId: UUID): ForumPost
    fun thankReply(replyId: UUID, userId: UUID): ForumReply
    fun setTopicActive(topicId: Int, active: Boolean): ForumTopic
    fun hasPosts(topicId: Int): Boolean
    fun deleteTopic(topicId: Int)
}
