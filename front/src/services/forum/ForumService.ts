import type {
  CreateForumPostInput,
  CreateForumReplyInput,
  ForumPost,
  ForumReply,
  ForumTopic,
} from './types.ts'

export interface ForumService {
  forumTopics(): Promise<ForumTopic[]>
  forumPosts(topicId?: string, limit?: number, offset?: number): Promise<ForumPost[]>
  forumPost(id: string): Promise<ForumPost | null>
  createForumPost(input: CreateForumPostInput): Promise<ForumPost>
  createForumReply(input: CreateForumReplyInput): Promise<ForumReply>
  thankForumPost(postId: string): Promise<ForumPost>
  thankForumReply(replyId: string): Promise<ForumReply>
}
