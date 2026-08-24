package com.jvmvstv_v.back.forum.model

import com.jvmvstv_v.back.user.model.User
import java.util.UUID

data class ForumTopic(
    val id: Int,
    val code: String,
    val title: String,
    val description: String?,
    val position: Int,
    val active: Boolean,
)

data class ForumPost(
    val id: UUID,
    val topic: ForumTopic,
    val author: User,
    val title: String,
    val body: String,
    val replyCount: Int,
    val thanksCount: Int,
    val pinned: Boolean,
    val photos: List<ForumPostPhoto>,
    val replies: List<ForumReply>,
    val createdAt: String,
    val updatedAt: String,
)

data class ForumPostPhoto(
    val id: UUID,
    val url: String,
    val caption: String?,
    val position: Int,
    val createdAt: String,
)

data class ForumReply(
    val id: UUID,
    val parentReply: ForumReply?,
    val author: User,
    val body: String,
    val thanksCount: Int,
    val createdAt: String,
    val updatedAt: String,
)

data class CreateForumPostInput(
    val topicId: Int,
    val title: String,
    val body: String,
    val photoUrls: List<String>?,
)

data class CreateForumReplyInput(
    val postId: UUID,
    val parentReplyId: UUID?,
    val body: String,
)
