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
    val imageId: UUID,
    val caption: String?,
    val position: Int,
    val createdAt: String,
)

data class NewForumPostPhotoInput(
    val mimeType: String,
    val imageBase64: String,
    val caption: String?,
)

data class NewForumPostPhoto(
    val id: UUID,
    val imageId: UUID,
    val caption: String?,
)

data class ForumReply(
    val id: UUID,
    val parentReply: ForumReply?,
    val author: User,
    val body: String,
    val thanksCount: Int,
    val photos: List<ForumReplyPhoto>,
    val createdAt: String,
    val updatedAt: String,
)

data class ForumReplyPhoto(
    val id: UUID,
    val imageId: UUID,
    val caption: String?,
    val position: Int,
    val createdAt: String,
)

data class NewForumReplyPhotoInput(
    val mimeType: String,
    val imageBase64: String,
    val caption: String?,
)

data class NewForumReplyPhoto(
    val id: UUID,
    val imageId: UUID,
    val caption: String?,
)

data class CreateForumPostInput(
    val topicId: Int,
    val title: String,
    val body: String,
    val photos: List<NewForumPostPhotoInput>?,
)

data class CreateForumReplyInput(
    val postId: UUID,
    val parentReplyId: UUID?,
    val body: String,
    val photos: List<NewForumReplyPhotoInput>?,
)

data class CreateForumTopicInput(
    val code: String,
    val title: String,
    val description: String?,
)

data class UpdateForumPostInput(
    val title: String?,
    val body: String?,
)
