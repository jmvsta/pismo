package com.jvmvstv_v.back.forum.service

import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.CreateForumTopicInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.forum.model.NewForumPostPhoto
import com.jvmvstv_v.back.forum.model.UpdateForumPostInput
import com.jvmvstv_v.back.forum.repository.ForumRepository
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ForumServiceImpl(
    private val forumRepository: ForumRepository,
    private val imageService: ImageService,
) : ForumService {
    override fun topics(): List<ForumTopic> = forumRepository.findTopics()

    override fun posts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost> =
        forumRepository.findPosts(topicId, limit, offset)

    override fun post(id: UUID): ForumPost? = forumRepository.findPostById(id)

    override fun createPost(input: CreateForumPostInput): ForumPost {
        val topic = forumRepository.findTopicById(input.topicId) ?: throw AuthException("Topic not found")
        if (!topic.active) throw AuthException("This topic is frozen and isn't accepting new posts")
        val photos = input.photos.orEmpty().map { photo ->
            val photoId = UUID.randomUUID()
            val image = imageService.store(ImageOwnerType.FORUM_POST_PHOTO, photoId, photo.mimeType, photo.imageBase64)
            NewForumPostPhoto(id = photoId, imageId = image.id, caption = photo.caption)
        }
        return forumRepository.createPost(CurrentUser.id, input, photos)
    }

    override fun createReply(input: CreateForumReplyInput): ForumReply {
        val post = forumRepository.findPostById(input.postId) ?: throw AuthException("Post not found")
        if (!post.topic.active) throw AuthException("This topic is frozen and isn't accepting new replies")
        return forumRepository.createReply(CurrentUser.id, input)
    }

    override fun updatePost(id: UUID, input: UpdateForumPostInput): ForumPost {
        val post = forumRepository.findPostById(id) ?: throw AuthException("Post not found")
        if (post.author.id != CurrentUser.id) throw AuthException("You can only edit your own post")
        return forumRepository.updatePost(id, input)
    }

    override fun updateReply(id: UUID, body: String): ForumReply {
        val reply = forumRepository.findReplyById(id) ?: throw AuthException("Reply not found")
        if (reply.author.id != CurrentUser.id) throw AuthException("You can only edit your own reply")
        return forumRepository.updateReply(id, body)
    }

    override fun thankPost(postId: UUID): ForumPost = forumRepository.thankPost(postId, CurrentUser.id)

    override fun thankReply(replyId: UUID): ForumReply = forumRepository.thankReply(replyId, CurrentUser.id)

    override fun createTopic(input: CreateForumTopicInput): ForumTopic {
        CurrentUser.requireModerator()
        return forumRepository.createTopic(input)
    }

    override fun setTopicActive(topicId: Int, active: Boolean): ForumTopic {
        CurrentUser.requireAdmin()
        return forumRepository.setTopicActive(topicId, active)
    }

    override fun deleteTopic(topicId: Int) {
        CurrentUser.requireAdmin()
        if (forumRepository.hasPosts(topicId)) throw AuthException("Cannot remove a topic that still has posts")
        forumRepository.deleteTopic(topicId)
    }
}
