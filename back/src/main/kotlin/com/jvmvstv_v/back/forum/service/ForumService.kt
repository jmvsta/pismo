package com.jvmvstv_v.back.forum.service

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import java.util.UUID

interface ForumService {
    fun topics(): List<ForumTopic>
    fun posts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost>
    fun post(id: UUID): ForumPost?
    fun createPost(input: CreateForumPostInput): ForumPost
    fun createReply(input: CreateForumReplyInput): ForumReply
    fun thankPost(postId: UUID): ForumPost
    fun thankReply(replyId: UUID): ForumReply
}
