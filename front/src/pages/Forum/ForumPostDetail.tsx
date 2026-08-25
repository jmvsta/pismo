import { useMemo, useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumReply } from '../../services/forum/index.ts'
import ThanksButton from './ThanksButton.tsx'
import ForumReplyComposer from './ForumReplyComposer.tsx'
import ForumReplyThread from './ForumReplyThread.tsx'

interface ForumPostDetailProps {
  post: ForumPost
  onClose: () => void
  onPostThanked: (post: ForumPost) => void
  onReplyAdded: (postId: string, reply: ForumReply) => void
  onReplyThanked: (postId: string, reply: ForumReply) => void
}

function groupRepliesByParent(replies: ForumReply[]) {
  const topLevel: ForumReply[] = []
  const byParent = new Map<string, ForumReply[]>()

  for (const reply of replies) {
    if (reply.parentReplyId === null) {
      topLevel.push(reply)
      continue
    }
    const siblings = byParent.get(reply.parentReplyId) ?? []
    siblings.push(reply)
    byParent.set(reply.parentReplyId, siblings)
  }

  return { topLevel, byParent }
}

function ForumPostDetail({ post, onClose, onPostThanked, onReplyAdded, onReplyThanked }: ForumPostDetailProps) {
  const [isComposingTopLevel, setIsComposingTopLevel] = useState(false)

  const { topLevel, byParent } = useMemo(() => groupRepliesByParent(post.replies), [post.replies])

  const handlePostThank = async () => {
    const updated = await forumService.thankForumPost(post.id)
    onPostThanked(updated)
  }

  const handleTopLevelReply = async (body: string) => {
    const created = await forumService.createForumReply({ postId: post.id, body })
    onReplyAdded(post.id, created)
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal forum-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h5>{post.title}</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="forum-post-meta">
          <span className="tag tag-accent">{post.topic.title}</span>
          <span className="text-muted">{post.author.nickname}</span>
        </div>
        <p className="forum-post-detail-body">{post.body}</p>
        <ThanksButton count={post.thanksCount} onThank={handlePostThank} />

        <div className="forum-reply-thread">
          <div className="forum-reply-thread-header">
            <h6>Replies</h6>
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => setIsComposingTopLevel((prev) => !prev)}
              aria-label="New reply thread"
            >
              +
            </button>
          </div>

          {isComposingTopLevel && (
            <ForumReplyComposer
              placeholder="Start a new reply thread…"
              onSubmit={handleTopLevelReply}
              onCancel={() => setIsComposingTopLevel(false)}
            />
          )}

          {topLevel.length === 0 && !isComposingTopLevel && <p className="text-muted">No replies yet.</p>}

          {topLevel.map((reply) => (
            <ForumReplyThread
              key={reply.id}
              reply={reply}
              childrenByParentId={byParent}
              postId={post.id}
              onReplyPosted={(created) => onReplyAdded(post.id, created)}
              onThanked={(updated) => onReplyThanked(post.id, updated)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ForumPostDetail
