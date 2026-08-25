package com.jvmvstv_v.back.forum.resolver

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.CreateForumTopicInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.forum.model.UpdateForumPostInput
import com.jvmvstv_v.back.forum.service.ForumService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class ForumResolver(private val forumService: ForumService) {
    @QueryMapping
    fun forumTopics(): List<ForumTopic> = forumService.topics()

    @QueryMapping
    fun forumPosts(@Argument topicId: Int?, @Argument limit: Int?, @Argument offset: Int?): List<ForumPost> =
        forumService.posts(topicId, limit, offset)

    @QueryMapping
    fun forumPost(@Argument id: UUID): ForumPost? = forumService.post(id)

    @MutationMapping
    fun createForumPost(@Argument input: CreateForumPostInput): ForumPost = forumService.createPost(input)

    @MutationMapping
    fun createForumReply(@Argument input: CreateForumReplyInput): ForumReply = forumService.createReply(input)

    @MutationMapping
    fun updateForumPost(@Argument id: UUID, @Argument input: UpdateForumPostInput): ForumPost =
        forumService.updatePost(id, input)

    @MutationMapping
    fun updateForumReply(@Argument id: UUID, @Argument body: String): ForumReply =
        forumService.updateReply(id, body)

    @MutationMapping
    fun thankForumPost(@Argument postId: UUID): ForumPost = forumService.thankPost(postId)

    @MutationMapping
    fun thankForumReply(@Argument replyId: UUID): ForumReply = forumService.thankReply(replyId)

    @MutationMapping
    fun createForumTopic(@Argument input: CreateForumTopicInput): ForumTopic = forumService.createTopic(input)

    @MutationMapping
    fun setForumTopicActive(@Argument topicId: Int, @Argument active: Boolean): ForumTopic =
        forumService.setTopicActive(topicId, active)

    @MutationMapping
    fun deleteForumTopic(@Argument topicId: Int): Boolean {
        forumService.deleteTopic(topicId)
        return true
    }
}
