import { useState } from 'react'
import type { ForumPost, ForumReply } from '../../services/forum/index.ts'
import ForumPostCard from '../Forum/ForumPostCard.tsx'
import ForumPostDetail from '../Forum/ForumPostDetail.tsx'

interface ProfileForumActivityProps {
  posts: ForumPost[]
}

function ProfileForumActivity({ posts: initialPosts }: ProfileForumActivityProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null

  const handlePostThanked = (updated: ForumPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)))
  }

  const handleReplyAdded = (postId: string, reply: ForumReply) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, replies: [...post.replies, reply], replyCount: post.replyCount + 1 }
          : post,
      ),
    )
  }

  const handleReplyThanked = (postId: string, updated: ForumReply) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, replies: post.replies.map((reply) => (reply.id === updated.id ? updated : reply)) }
          : post,
      ),
    )
  }

  const handlePostUpdated = (updated: ForumPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)))
  }

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    setSelectedPostId(null)
  }

  const handleReplyUpdated = (postId: string, updated: ForumReply) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, replies: post.replies.map((reply) => (reply.id === updated.id ? updated : reply)) }
          : post,
      ),
    )
  }

  const handleReplyDeleted = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: post.replies.filter((reply) => reply.id !== replyId),
              replyCount: Math.max(0, post.replyCount - 1),
            }
          : post,
      ),
    )
  }

  if (posts.length === 0) {
    return <p className="text-muted profile-empty">You haven't posted in the forum yet.</p>
  }

  return (
    <div className="profile-forum-activity">
      {posts.map((post) => (
        <ForumPostCard
          key={post.id}
          post={post}
          onOpen={(opened) => setSelectedPostId(opened.id)}
          onThanked={handlePostThanked}
        />
      ))}

      {selectedPost && (
        <ForumPostDetail
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onPostThanked={handlePostThanked}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
          onReplyAdded={handleReplyAdded}
          onReplyThanked={handleReplyThanked}
          onReplyUpdated={handleReplyUpdated}
          onReplyDeleted={handleReplyDeleted}
        />
      )}
    </div>
  )
}

export default ProfileForumActivity
