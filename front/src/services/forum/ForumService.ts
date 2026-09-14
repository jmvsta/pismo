import type {
  CreateForumPostInput,
  CreateForumReplyInput,
  CreateForumTopicInput,
  ForumPost,
  ForumReply,
  ForumTopic,
  UpdateForumPostInput,
  UpdateForumReplyInput,
} from './types.ts'

export interface ForumService {
  forumTopics(): Promise<ForumTopic[]>
  forumPosts(topicId?: string, limit?: number, offset?: number): Promise<ForumPost[]>
  forumPost(id: string): Promise<ForumPost | null>
  createForumPost(input: CreateForumPostInput): Promise<ForumPost>
  createForumReply(input: CreateForumReplyInput): Promise<ForumReply>
  updateForumPost(id: string, input: UpdateForumPostInput): Promise<ForumPost>
  updateForumReply(id: string, input: UpdateForumReplyInput): Promise<ForumReply>
  deleteForumPost(id: string): Promise<void>
  deleteForumReply(id: string): Promise<void>
  thankForumPost(postId: string): Promise<ForumPost>
  thankForumReply(replyId: string): Promise<ForumReply>
  createForumTopic(input: CreateForumTopicInput): Promise<ForumTopic>
  setForumTopicActive(topicId: string, active: boolean): Promise<ForumTopic>
  deleteForumTopic(topicId: string): Promise<void>
}
