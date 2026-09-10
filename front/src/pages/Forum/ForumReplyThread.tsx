import { useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumReply, NewForumReplyPhotoInput } from '../../services/forum/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
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

  const handleSubmitReply = async (body: string, photos: NewForumReplyPhotoInput[]) => {
    const created = await forumService.createForumReply({ postId, parentReplyId: reply.id, body, photos })
    onReplyPosted(created)
  }

  return (
    <div className="forum-reply">
      <div className="forum-reply-meta text-muted">{reply.author.nickname}</div>
      <p className="forum-reply-body">{reply.body}</p>
      {reply.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reply.photos.map((photo) => (
            <img key={photo.id} src={imageUrl(photo.imageId) ?? ''} alt={photo.caption ?? ''} className="h-20 w-20 object-cover" />
          ))}
        </div>
      )}
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
