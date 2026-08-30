import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type { UserSummary } from '../user/types.ts'
import type {
  CreateForumPostInput,
  CreateForumReplyInput,
  CreateForumTopicInput,
  ForumPost,
  ForumReply,
  ForumTopic,
} from './types.ts'
import type { ForumService } from './ForumService.ts'

const TOPIC_FIELDS = `
  id
  code
  title
  description
  position
  active
`

const PHOTO_FIELDS = `
  id
  imageId
  caption
  position
  createdAt
`

// Wire shape mirrors the GraphQL response, where parentReply is a nested
// object reference rather than the flat id the ForumReply domain type uses.
interface ForumReplyWire {
  id: string
  parentReply: { id: string } | null
  author: UserSummary
  body: string
  thanksCount: number
  createdAt: string
  updatedAt: string
}

const REPLY_FIELDS = `
  id
  parentReply { id }
  author { ${USER_SUMMARY_FIELDS} }
  body
  thanksCount
  createdAt
  updatedAt
`

interface ForumPostWire {
  id: string
  topic: ForumTopic
  author: UserSummary
  title: string
  body: string
  replyCount: number
  thanksCount: number
  pinned: boolean
  photos: ForumPost['photos']
  replies: ForumReplyWire[]
  createdAt: string
  updatedAt: string
}

const POST_FIELDS = `
  id
  topic { ${TOPIC_FIELDS} }
  author { ${USER_SUMMARY_FIELDS} }
  title
  body
  replyCount
  thanksCount
  pinned
  photos { ${PHOTO_FIELDS} }
  replies { ${REPLY_FIELDS} }
  createdAt
  updatedAt
`

function toForumReply(wire: ForumReplyWire): ForumReply {
  return {
    id: wire.id,
    parentReplyId: wire.parentReply?.id ?? null,
    author: wire.author,
    body: wire.body,
    thanksCount: wire.thanksCount,
    createdAt: wire.createdAt,
    updatedAt: wire.updatedAt,
  }
}

function toForumPost(wire: ForumPostWire): ForumPost {
  return {
    ...wire,
    replies: wire.replies.map(toForumReply),
  }
}

const FORUM_TOPICS_QUERY = `
  query ForumTopics {
    forumTopics {
      ${TOPIC_FIELDS}
    }
  }
`

const FORUM_POSTS_QUERY = `
  query ForumPosts($topicId: ID, $limit: Int, $offset: Int) {
    forumPosts(topicId: $topicId, limit: $limit, offset: $offset) {
      ${POST_FIELDS}
    }
  }
`

const FORUM_POST_QUERY = `
  query ForumPost($id: ID!) {
    forumPost(id: $id) {
      ${POST_FIELDS}
    }
  }
`

const CREATE_FORUM_POST_MUTATION = `
  mutation CreateForumPost($input: CreateForumPostInput!) {
    createForumPost(input: $input) {
      ${POST_FIELDS}
    }
  }
`

const CREATE_FORUM_REPLY_MUTATION = `
  mutation CreateForumReply($input: CreateForumReplyInput!) {
    createForumReply(input: $input) {
      ${REPLY_FIELDS}
    }
  }
`

const THANK_FORUM_POST_MUTATION = `
  mutation ThankForumPost($postId: ID!) {
    thankForumPost(postId: $postId) {
      ${POST_FIELDS}
    }
  }
`

const THANK_FORUM_REPLY_MUTATION = `
  mutation ThankForumReply($replyId: ID!) {
    thankForumReply(replyId: $replyId) {
      ${REPLY_FIELDS}
    }
  }
`

const CREATE_FORUM_TOPIC_MUTATION = `
  mutation CreateForumTopic($input: CreateForumTopicInput!) {
    createForumTopic(input: $input) {
      ${TOPIC_FIELDS}
    }
  }
`

const SET_FORUM_TOPIC_ACTIVE_MUTATION = `
  mutation SetForumTopicActive($topicId: ID!, $active: Boolean!) {
    setForumTopicActive(topicId: $topicId, active: $active) {
      ${TOPIC_FIELDS}
    }
  }
`

const DELETE_FORUM_TOPIC_MUTATION = `
  mutation DeleteForumTopic($topicId: ID!) {
    deleteForumTopic(topicId: $topicId)
  }
`

export class GraphqlForumService implements ForumService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async forumTopics(): Promise<ForumTopic[]> {
    const data = await this.client.request<{ forumTopics: ForumTopic[] }>(FORUM_TOPICS_QUERY)
    return data.forumTopics
  }

  async forumPosts(topicId?: string, limit?: number, offset?: number): Promise<ForumPost[]> {
    const data = await this.client.request<
      { forumPosts: ForumPostWire[] },
      { topicId?: string; limit?: number; offset?: number }
    >(FORUM_POSTS_QUERY, { topicId, limit, offset })
    return data.forumPosts.map(toForumPost)
  }

  async forumPost(id: string): Promise<ForumPost | null> {
    const data = await this.client.request<{ forumPost: ForumPostWire | null }, { id: string }>(
      FORUM_POST_QUERY,
      { id },
    )
    return data.forumPost ? toForumPost(data.forumPost) : null
  }

  async createForumPost(input: CreateForumPostInput): Promise<ForumPost> {
    const data = await this.client.request<
      { createForumPost: ForumPostWire },
      { input: CreateForumPostInput }
    >(CREATE_FORUM_POST_MUTATION, { input })
    return toForumPost(data.createForumPost)
  }

  async createForumReply(input: CreateForumReplyInput): Promise<ForumReply> {
    const data = await this.client.request<
      { createForumReply: ForumReplyWire },
      { input: CreateForumReplyInput }
    >(CREATE_FORUM_REPLY_MUTATION, { input })
    return toForumReply(data.createForumReply)
  }

  async thankForumPost(postId: string): Promise<ForumPost> {
    const data = await this.client.request<{ thankForumPost: ForumPostWire }, { postId: string }>(
      THANK_FORUM_POST_MUTATION,
      { postId },
    )
    return toForumPost(data.thankForumPost)
  }

  async thankForumReply(replyId: string): Promise<ForumReply> {
    const data = await this.client.request<{ thankForumReply: ForumReplyWire }, { replyId: string }>(
      THANK_FORUM_REPLY_MUTATION,
      { replyId },
    )
    return toForumReply(data.thankForumReply)
  }

  async createForumTopic(input: CreateForumTopicInput): Promise<ForumTopic> {
    const data = await this.client.request<
      { createForumTopic: ForumTopic },
      { input: CreateForumTopicInput }
    >(CREATE_FORUM_TOPIC_MUTATION, { input })
    return data.createForumTopic
  }

  async setForumTopicActive(topicId: string, active: boolean): Promise<ForumTopic> {
    const data = await this.client.request<
      { setForumTopicActive: ForumTopic },
      { topicId: string; active: boolean }
    >(SET_FORUM_TOPIC_ACTIVE_MUTATION, { topicId, active })
    return data.setForumTopicActive
  }

  async deleteForumTopic(topicId: string): Promise<void> {
    await this.client.request<{ deleteForumTopic: boolean }, { topicId: string }>(
      DELETE_FORUM_TOPIC_MUTATION,
      { topicId },
    )
  }
}
