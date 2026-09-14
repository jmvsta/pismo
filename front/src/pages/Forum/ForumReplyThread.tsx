import { useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumReply, NewForumReplyPhotoInput } from '../../services/forum/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { useUserStore } from '../../store/userStore.ts'
import { renderRichText } from '../../lib/richText.tsx'
import ThanksButton from './ThanksButton.tsx'
import ForumReplyComposer from './ForumReplyComposer.tsx'
import ForumEditForm from './ForumEditForm.tsx'

interface ForumReplyThreadProps {
  reply: ForumReply
  childrenByParentId: Map<string, ForumReply[]>
  postId: string
  onReplyPosted: (reply: ForumReply) => void
  onThanked: (reply: ForumReply) => void
  onReplyUpdated: (reply: ForumReply) => void
  onReplyDeleted: (replyId: string) => void
}

function ForumReplyThread({
  reply,
  childrenByParentId,
  postId,
  onReplyPosted,
  onThanked,
  onReplyUpdated,
  onReplyDeleted,
}: ForumReplyThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const currentUser = useUserStore((state) => state.currentUser)
  const children = childrenByParentId.get(reply.id) ?? []

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'
  const canEdit = !!currentUser && (currentUser.id === reply.author.id || canModerate)

  const handleThank = async () => {
    const updated = await forumService.thankForumReply(reply.id)
    onThanked(updated)
  }

  const handleSubmitReply = async (body: string, photos: NewForumReplyPhotoInput[]) => {
    const created = await forumService.createForumReply({ postId, parentReplyId: reply.id, body, photos })
    onReplyPosted(created)
  }

  const handleReplySave = async (values: {
    body: string
    newPhotos: { mimeType: string; imageBase64: string; caption?: string }[]
    removePhotoIds: string[]
  }) => {
    const updated = await forumService.updateForumReply(reply.id, {
      body: values.body,
      photos: values.newPhotos,
      removePhotoIds: values.removePhotoIds,
    })
    onReplyUpdated(updated)
    setIsEditing(false)
  }

  const handleReplyDelete = async () => {
    if (!window.confirm('Delete this reply?')) return
    await forumService.deleteForumReply(reply.id)
    onReplyDeleted(reply.id)
  }

  return (
    <div className="forum-reply">
      <div className="forum-reply-meta text-muted">
        {reply.author.nickname}
        {canEdit && !isEditing && (
          <span className="forum-item-actions">
            <button type="button" className="forum-reply-link" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button type="button" className="forum-reply-link" onClick={handleReplyDelete}>
              Delete
            </button>
          </span>
        )}
      </div>
      {isEditing ? (
        <ForumEditForm
          initialBody={reply.body}
          existingPhotos={reply.photos}
          onSave={handleReplySave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="forum-reply-body">{renderRichText(reply.body)}</div>
          {reply.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reply.photos.map((photo) => (
                <img key={photo.id} src={imageUrl(photo.imageId) ?? ''} alt={photo.caption ?? ''} className="h-20 w-20 object-cover" />
              ))}
            </div>
          )}
        </>
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
              onReplyUpdated={onReplyUpdated}
              onReplyDeleted={onReplyDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ForumReplyThread
