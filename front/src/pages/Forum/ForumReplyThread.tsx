import { useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumReply } from '../../services/forum/index.ts'
import ThanksButton from './ThanksButton.tsx'
import ForumReplyComposer from './ForumReplyComposer.tsx'

interface ForumReplyThreadProps {
  reply: ForumReply
  childrenByParentId: Map<string, ForumReply[]>
  postId: string
  onReplyPosted: (reply: ForumReply) => void
  onThanked: (reply: ForumReply) => void
}

function ForumReplyThread({ reply, childrenByParentId, postId, onReplyPosted, onThanked }: ForumReplyThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const children = childrenByParentId.get(reply.id) ?? []

  const handleThank = async () => {
    const updated = await forumService.thankForumReply(reply.id)
    onThanked(updated)
  }

  const handleSubmitReply = async (body: string) => {
    const created = await forumService.createForumReply({ postId, parentReplyId: reply.id, body })
    onReplyPosted(created)
  }

  return (
    <div className="forum-reply">
      <div className="forum-reply-meta text-muted">{reply.author.nickname}</div>
      <p className="forum-reply-body">{reply.body}</p>
      <div className="forum-reply-actions text-muted">
        <ThanksButton count={reply.thanksCount} onThank={handleThank} />
        <button type="button" className="forum-reply-link" onClick={() => setIsReplying((prev) => !prev)}>
          Reply
        </button>
      </div>
      {isReplying && <ForumReplyComposer onSubmit={handleSubmitReply} onCancel={() => setIsReplying(false)} />}
      {children.length > 0 && (
        <div className="forum-reply-children">
          {children.map((child) => (
            <ForumReplyThread
              key={child.id}
              reply={child}
              childrenByParentId={childrenByParentId}
              postId={postId}
              onReplyPosted={onReplyPosted}
              onThanked={onThanked}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ForumReplyThread
