import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlForumService } from './GraphqlForumService.ts'

export type { ForumService } from './ForumService.ts'
export type {
  ForumTopic,
  ForumPost,
  ForumPostPhoto,
  NewForumPostPhotoInput,
  ForumReply,
  CreateForumPostInput,
  CreateForumReplyInput,
  CreateForumTopicInput,
} from './types.ts'

export const forumService = new GraphqlForumService(graphqlClient)
