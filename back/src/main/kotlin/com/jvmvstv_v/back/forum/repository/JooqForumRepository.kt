package com.jvmvstv_v.back.forum.repository

import com.jvmvstv_v.back.forum.model.CreateForumPostInput
import com.jvmvstv_v.back.forum.model.CreateForumReplyInput
import com.jvmvstv_v.back.forum.model.ForumPost
import com.jvmvstv_v.back.forum.model.ForumPostPhoto
import com.jvmvstv_v.back.forum.model.ForumReply
import com.jvmvstv_v.back.forum.model.ForumTopic
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqForumRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
) : ForumRepository {
    private val TOPICS = DSL.table("forum_topics")
    private val T_ID = DSL.field("id", SQLDataType.INTEGER)
    private val T_CODE = DSL.field("code", SQLDataType.VARCHAR)
    private val T_TITLE = DSL.field("title", SQLDataType.VARCHAR)
    private val T_DESCRIPTION = DSL.field("description", SQLDataType.VARCHAR)
    private val T_POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val T_ACTIVE = DSL.field("active", SQLDataType.BOOLEAN)

    private val POSTS = DSL.table("forum_posts")
    private val P_ID = DSL.field("id", SQLDataType.UUID)
    private val P_TOPIC_ID = DSL.field("topic_id", SQLDataType.INTEGER)
    private val P_AUTHOR_ID = DSL.field("author_id", SQLDataType.UUID)
    private val P_TITLE = DSL.field("title", SQLDataType.VARCHAR)
    private val P_BODY = DSL.field("body", SQLDataType.VARCHAR)
    private val P_REPLY_COUNT = DSL.field("reply_count", SQLDataType.INTEGER)
    private val P_THANKS_COUNT = DSL.field("thanks_count", SQLDataType.INTEGER)
    private val P_PINNED = DSL.field("pinned", SQLDataType.BOOLEAN)
    private val P_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val P_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val P_DELETED_AT = DSL.field("deleted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val PHOTOS = DSL.table("forum_post_photos")
    private val PH_ID = DSL.field("id", SQLDataType.UUID)
    private val PH_POST_ID = DSL.field("post_id", SQLDataType.UUID)
    private val PH_URL = DSL.field("url", SQLDataType.VARCHAR)
    private val PH_CAPTION = DSL.field("caption", SQLDataType.VARCHAR)
    private val PH_POSITION = DSL.field("position", SQLDataType.INTEGER)
    private val PH_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val REPLIES = DSL.table("forum_replies")
    private val RP_ID = DSL.field("id", SQLDataType.UUID)
    private val RP_POST_ID = DSL.field("post_id", SQLDataType.UUID)
    private val RP_PARENT_ID = DSL.field("parent_reply_id", SQLDataType.UUID)
    private val RP_AUTHOR_ID = DSL.field("author_id", SQLDataType.UUID)
    private val RP_BODY = DSL.field("body", SQLDataType.VARCHAR)
    private val RP_THANKS_COUNT = DSL.field("thanks_count", SQLDataType.INTEGER)
    private val RP_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val RP_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val RP_DELETED_AT = DSL.field("deleted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val POST_THANKS = DSL.table("forum_post_thanks")
    private val PT_POST_ID = DSL.field("post_id", SQLDataType.UUID)
    private val PT_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val PT_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val REPLY_THANKS = DSL.table("forum_reply_thanks")
    private val RT_REPLY_ID = DSL.field("reply_id", SQLDataType.UUID)
    private val RT_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val RT_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findTopics(): List<ForumTopic> =
        dsl.select(T_ID, T_CODE, T_TITLE, T_DESCRIPTION, T_POSITION, T_ACTIVE)
            .from(TOPICS)
            .orderBy(T_POSITION)
            .fetch { toTopic(it) }

    override fun findPosts(topicId: Int?, limit: Int?, offset: Int?): List<ForumPost> {
        val step = dsl.select(P_ID, P_TOPIC_ID, P_AUTHOR_ID, P_TITLE, P_BODY, P_REPLY_COUNT, P_THANKS_COUNT,
            P_PINNED, P_CREATED_AT, P_UPDATED_AT)
            .from(POSTS)
            .where(P_DELETED_AT.isNull)
        val filtered = if (topicId != null) step.and(P_TOPIC_ID.eq(topicId)) else step
        return filtered.orderBy(P_CREATED_AT.desc())
            .limit(limit ?: Int.MAX_VALUE)
            .offset(offset ?: 0)
            .fetch { toPost(it) }
    }

    override fun findPostById(id: UUID): ForumPost? =
        dsl.select(P_ID, P_TOPIC_ID, P_AUTHOR_ID, P_TITLE, P_BODY, P_REPLY_COUNT, P_THANKS_COUNT,
            P_PINNED, P_CREATED_AT, P_UPDATED_AT)
            .from(POSTS)
            .where(P_ID.eq(id)).and(P_DELETED_AT.isNull)
            .fetchOne { toPost(it) }

    override fun createPost(authorId: UUID, input: CreateForumPostInput): ForumPost {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        dsl.insertInto(POSTS)
            .columns(P_ID, P_TOPIC_ID, P_AUTHOR_ID, P_TITLE, P_BODY, P_CREATED_AT, P_UPDATED_AT)
            .values(id, input.topicId, authorId, input.title, input.body, now, now)
            .execute()
        input.photoUrls?.forEachIndexed { index, url ->
            dsl.insertInto(PHOTOS)
                .columns(PH_ID, PH_POST_ID, PH_URL, PH_POSITION, PH_CREATED_AT)
                .values(UUID.randomUUID(), id, url, index, now)
                .execute()
        }
        return findPostById(id) ?: error("Forum post $id not found")
    }

    override fun createReply(authorId: UUID, input: CreateForumReplyInput): ForumReply {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        dsl.insertInto(REPLIES)
            .columns(RP_ID, RP_POST_ID, RP_PARENT_ID, RP_AUTHOR_ID, RP_BODY, RP_CREATED_AT, RP_UPDATED_AT)
            .values(id, input.postId, input.parentReplyId, authorId, input.body, now, now)
            .execute()
        dsl.update(POSTS)
            .set(P_REPLY_COUNT, P_REPLY_COUNT.plus(1))
            .where(P_ID.eq(input.postId))
            .execute()
        return findReplyById(id) ?: error("Forum reply $id not found")
    }

    override fun thankPost(postId: UUID, userId: UUID): ForumPost {
        val inserted = dsl.insertInto(POST_THANKS)
            .columns(PT_POST_ID, PT_USER_ID, PT_CREATED_AT)
            .values(postId, userId, OffsetDateTime.now())
            .onConflictDoNothing()
            .execute()
        if (inserted > 0) {
            dsl.update(POSTS).set(P_THANKS_COUNT, P_THANKS_COUNT.plus(1)).where(P_ID.eq(postId)).execute()
        }
        return findPostById(postId) ?: error("Forum post $postId not found")
    }

    override fun thankReply(replyId: UUID, userId: UUID): ForumReply {
        val inserted = dsl.insertInto(REPLY_THANKS)
            .columns(RT_REPLY_ID, RT_USER_ID, RT_CREATED_AT)
            .values(replyId, userId, OffsetDateTime.now())
            .onConflictDoNothing()
            .execute()
        if (inserted > 0) {
            dsl.update(REPLIES).set(RP_THANKS_COUNT, RP_THANKS_COUNT.plus(1)).where(RP_ID.eq(replyId)).execute()
        }
        return findReplyById(replyId) ?: error("Forum reply $replyId not found")
    }

    private fun findTopicById(id: Int): ForumTopic? =
        dsl.select(T_ID, T_CODE, T_TITLE, T_DESCRIPTION, T_POSITION, T_ACTIVE)
            .from(TOPICS)
            .where(T_ID.eq(id))
            .fetchOne { toTopic(it) }

    private fun findPhotosForPost(postId: UUID): List<ForumPostPhoto> =
        dsl.select(PH_ID, PH_URL, PH_CAPTION, PH_POSITION, PH_CREATED_AT)
            .from(PHOTOS)
            .where(PH_POST_ID.eq(postId))
            .orderBy(PH_POSITION)
            .fetch {
                ForumPostPhoto(
                    id = it[PH_ID]!!,
                    url = it[PH_URL]!!,
                    caption = it[PH_CAPTION],
                    position = it[PH_POSITION]!!,
                    createdAt = it[PH_CREATED_AT]!!.toString(),
                )
            }

    private fun findRepliesForPost(postId: UUID): List<ForumReply> =
        dsl.select(RP_ID, RP_PARENT_ID, RP_AUTHOR_ID, RP_BODY, RP_THANKS_COUNT, RP_CREATED_AT, RP_UPDATED_AT)
            .from(REPLIES)
            .where(RP_POST_ID.eq(postId)).and(RP_DELETED_AT.isNull)
            .orderBy(RP_CREATED_AT)
            .fetch { toReply(it) }

    private fun findReplyById(id: UUID): ForumReply? =
        dsl.select(RP_ID, RP_PARENT_ID, RP_AUTHOR_ID, RP_BODY, RP_THANKS_COUNT, RP_CREATED_AT, RP_UPDATED_AT)
            .from(REPLIES)
            .where(RP_ID.eq(id)).and(RP_DELETED_AT.isNull)
            .fetchOne { toReply(it) }

    private fun toTopic(record: Record): ForumTopic = ForumTopic(
        id = record[T_ID]!!,
        code = record[T_CODE]!!,
        title = record[T_TITLE]!!,
        description = record[T_DESCRIPTION],
        position = record[T_POSITION]!!,
        active = record[T_ACTIVE]!!,
    )

    private fun toPost(record: Record): ForumPost {
        val id = record[P_ID]!!
        return ForumPost(
            id = id,
            topic = findTopicById(record[P_TOPIC_ID]!!) ?: error("Forum topic not found"),
            author = userRepository.findById(record[P_AUTHOR_ID]!!) ?: error("User not found"),
            title = record[P_TITLE]!!,
            body = record[P_BODY]!!,
            replyCount = record[P_REPLY_COUNT]!!,
            thanksCount = record[P_THANKS_COUNT]!!,
            pinned = record[P_PINNED]!!,
            photos = findPhotosForPost(id),
            replies = findRepliesForPost(id),
            createdAt = record[P_CREATED_AT]!!.toString(),
            updatedAt = record[P_UPDATED_AT]!!.toString(),
        )
    }

    private fun toReply(record: Record): ForumReply = ForumReply(
        id = record[RP_ID]!!,
        parentReply = record[RP_PARENT_ID]?.let { findReplyById(it) },
        author = userRepository.findById(record[RP_AUTHOR_ID]!!) ?: error("User not found"),
        body = record[RP_BODY]!!,
        thanksCount = record[RP_THANKS_COUNT]!!,
        createdAt = record[RP_CREATED_AT]!!.toString(),
        updatedAt = record[RP_UPDATED_AT]!!.toString(),
    )
}
