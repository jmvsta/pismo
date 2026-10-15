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
import com.jvmvstv_v.back.forum.model.NewForumReplyPhoto
import com.jvmvstv_v.back.forum.model.UpdateForumPostInput
import com.jvmvstv_v.back.forum.model.UpdateForumReplyInput
import com.jvmvstv_v.back.forum.repository.ForumRepository
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ForumServiceImpl(
    private val forumRepository: ForumRepository,
    private val imageService: ImageService,
) : ForumService {
    private val logger = LoggerFactory.getLogger(ForumServiceImpl::class.java)

    override fun topics(): List<ForumTopic> = forumRepository.findTopics()

    override fun posts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost> =
        forumRepository.findPosts(topicId, limit, offset, CurrentUser.idOrNull)

    override fun post(id: UUID): ForumPost? = forumRepository.findPostById(id, CurrentUser.idOrNull)

    override fun createPost(input: CreateForumPostInput): ForumPost {
        val topic = forumRepository.findTopicById(input.topicId) ?: throw AuthException("Topic not found")
        if (!topic.active) throw AuthException("This topic is frozen and isn't accepting new posts")
        val photos = input.photos.orEmpty().map { photo ->
            val photoId = UUID.randomUUID()
            val image = imageService.store(ImageOwnerType.FORUM_POST_PHOTO, photoId, photo.mimeType, photo.imageBase64)
            NewForumPostPhoto(id = photoId, imageId = image.id, caption = photo.caption)
        }
        val created = forumRepository.createPost(CurrentUser.id, input, photos)
        logger.info("User {} created forum post {} in topic {} with {} photo(s)", CurrentUser.id, created.id, input.topicId, photos.size)
        return created
    }

    override fun createReply(input: CreateForumReplyInput): ForumReply {
        val post = forumRepository.findPostById(input.postId) ?: throw AuthException("Post not found")
        if (!post.topic.active) throw AuthException("This topic is frozen and isn't accepting new replies")
        val photos = input.photos.orEmpty().map { photo ->
            val photoId = UUID.randomUUID()
            val image = imageService.store(ImageOwnerType.FORUM_REPLY_PHOTO, photoId, photo.mimeType, photo.imageBase64)
            NewForumReplyPhoto(id = photoId, imageId = image.id, caption = photo.caption)
        }
        val created = forumRepository.createReply(CurrentUser.id, input, photos)
        logger.info("User {} replied to forum post {} (reply {}) with {} photo(s)", CurrentUser.id, input.postId, created.id, photos.size)
        return created
    }

    override fun updatePost(id: UUID, input: UpdateForumPostInput): ForumPost {
        val post = forumRepository.findPostById(id) ?: throw AuthException("Post not found")
        if (post.author.id != CurrentUser.id && !CurrentUser.canModerate) {
            throw AuthException("You can only edit your own post")
        }
        if (!input.removePhotoIds.isNullOrEmpty()) {
            forumRepository.removePostPhotos(id, input.removePhotoIds).forEach { imageService.delete(it) }
        }
        if (!input.photos.isNullOrEmpty()) {
            val newPhotos = input.photos.map { photo ->
                val photoId = UUID.randomUUID()
                val image = imageService.store(ImageOwnerType.FORUM_POST_PHOTO, photoId, photo.mimeType, photo.imageBase64)
                NewForumPostPhoto(id = photoId, imageId = image.id, caption = photo.caption)
            }
            forumRepository.addPostPhotos(id, newPhotos)
        }
        val updated = forumRepository.updatePost(id, input)
        logger.info("User {} edited forum post {} (author {})", CurrentUser.id, id, post.author.id)
        return updated
    }

    override fun updateReply(id: UUID, input: UpdateForumReplyInput): ForumReply {
        val reply = forumRepository.findReplyById(id) ?: throw AuthException("Reply not found")
        if (reply.author.id != CurrentUser.id && !CurrentUser.canModerate) {
            throw AuthException("You can only edit your own reply")
        }
        if (!input.removePhotoIds.isNullOrEmpty()) {
            forumRepository.removeReplyPhotos(id, input.removePhotoIds).forEach { imageService.delete(it) }
        }
        if (!input.photos.isNullOrEmpty()) {
            val newPhotos = input.photos.map { photo ->
                val photoId = UUID.randomUUID()
                val image = imageService.store(ImageOwnerType.FORUM_REPLY_PHOTO, photoId, photo.mimeType, photo.imageBase64)
                NewForumReplyPhoto(id = photoId, imageId = image.id, caption = photo.caption)
            }
            forumRepository.addReplyPhotos(id, newPhotos)
        }
        val updated = forumRepository.updateReply(id, input.body)
        logger.info("User {} edited forum reply {} (author {})", CurrentUser.id, id, reply.author.id)
        return updated
    }

    override fun deletePost(id: UUID) {
        val post = forumRepository.findPostById(id) ?: throw AuthException("Post not found")
        if (post.author.id != CurrentUser.id && !CurrentUser.canModerate) {
            throw AuthException("You can only delete your own post")
        }
        forumRepository.deletePost(id)
        logger.info("User {} deleted forum post {} (author {})", CurrentUser.id, id, post.author.id)
    }

    override fun deleteReply(id: UUID) {
        val reply = forumRepository.findReplyById(id) ?: throw AuthException("Reply not found")
        if (reply.author.id != CurrentUser.id && !CurrentUser.canModerate) {
            throw AuthException("You can only delete your own reply")
        }
        if (forumRepository.hasReplyChildren(id)) {
            throw AuthException("Cannot delete a reply that still has replies")
        }
        forumRepository.deleteReply(id)
        logger.info("User {} deleted forum reply {} (author {})", CurrentUser.id, id, reply.author.id)
    }

    override fun thankPost(postId: UUID): ForumPost {
        val post = forumRepository.findPostById(postId) ?: throw AuthException("Post not found")
        if (post.author.id == CurrentUser.id) throw AuthException("You can't thank your own post")
        return forumRepository.thankPost(postId, CurrentUser.id)
    }

    override fun thankReply(replyId: UUID): ForumReply {
        val reply = forumRepository.findReplyById(replyId) ?: throw AuthException("Reply not found")
        if (reply.author.id == CurrentUser.id) throw AuthException("You can't thank your own reply")
        return forumRepository.thankReply(replyId, CurrentUser.id)
    }

    override fun createTopic(input: CreateForumTopicInput): ForumTopic {
        CurrentUser.requireModerator()
        val created = forumRepository.createTopic(input)
        logger.info("User {} created forum topic {}", CurrentUser.id, created.id)
        return created
    }

    override fun setTopicActive(topicId: Int, active: Boolean): ForumTopic {
        CurrentUser.requireAdmin()
        val updated = forumRepository.setTopicActive(topicId, active)
        logger.info("Admin {} {} forum topic {}", CurrentUser.id, if (active) "unfroze" else "froze", topicId)
        return updated
    }

    override fun deleteTopic(topicId: Int) {
        CurrentUser.requireAdmin()
        if (forumRepository.hasPosts(topicId)) throw AuthException("Cannot remove a topic that still has posts")
        forumRepository.deleteTopic(topicId)
        logger.info("Admin {} deleted forum topic {}", CurrentUser.id, topicId)
    }
}
