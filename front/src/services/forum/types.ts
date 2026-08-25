import type { UserSummary } from '../user/types.ts'

export interface ForumTopic {
  id: string
  code: string
  title: string
  description: string | null
  position: number
  active: boolean
}

export interface ForumPostPhoto {
  id: string
  url: string
  caption: string | null
  position: number
  createdAt: string
}

/** parentReplyId is set for a threaded reply-to-a-reply; null for a top-level reply to the post. */
export interface ForumReply {
  id: string
  parentReplyId: string | null
  author: UserSummary
  body: string
  thanksCount: number
  createdAt: string
  updatedAt: string
}

export interface ForumPost {
  id: string
  topic: ForumTopic
  author: UserSummary
  title: string
  body: string
  replyCount: number
  thanksCount: number
  pinned: boolean
  photos: ForumPostPhoto[]
  replies: ForumReply[]
  createdAt: string
  updatedAt: string
}

export interface CreateForumPostInput {
  topicId: string
  title: string
  body: string
  photoUrls?: string[]
}

export interface CreateForumReplyInput {
  postId: string
  parentReplyId?: string
  body: string
}

export interface CreateForumTopicInput {
  code: string
  title: string
  description?: string
}
