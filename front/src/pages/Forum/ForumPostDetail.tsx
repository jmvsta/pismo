import { useMemo, useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumReply, NewForumReplyPhotoInput } from '../../services/forum/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { useUserStore } from '../../store/userStore.ts'
import { renderRichText } from '../../lib/richText.tsx'
import ThanksButton from './ThanksButton.tsx'
import ForumReplyComposer from './ForumReplyComposer.tsx'
import ForumReplyThread from './ForumReplyThread.tsx'
import ForumEditForm from './ForumEditForm.tsx'
import PhotoLightbox from '../../components/PhotoLightbox/PhotoLightbox.tsx'

interface ForumPostDetailProps {
  post: ForumPost
  onClose: () => void
  onPostThanked: (post: ForumPost) => void
  onPostUpdated: (post: ForumPost) => void
  onPostDeleted: (postId: string) => void
  onReplyAdded: (postId: string, reply: ForumReply) => void
  onReplyThanked: (postId: string, reply: ForumReply) => void
  onReplyUpdated: (postId: string, reply: ForumReply) => void
  onReplyDeleted: (postId: string, replyId: string) => void
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

function ForumPostDetail({
  post,
  onClose,
  onPostThanked,
  onPostUpdated,
  onPostDeleted,
  onReplyAdded,
  onReplyThanked,
  onReplyUpdated,
  onReplyDeleted,
}: ForumPostDetailProps) {
  const [isComposingTopLevel, setIsComposingTopLevel] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; alt: string } | null>(null)
  const currentUser = useUserStore((state) => state.currentUser)

  const { topLevel, byParent } = useMemo(() => groupRepliesByParent(post.replies), [post.replies])

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'
  const canEdit = !!currentUser && (currentUser.id === post.author.id || canModerate)

  const handlePostThank = async () => {
    const updated = await forumService.thankForumPost(post.id)
    onPostThanked(updated)
  }

  const handleTopLevelReply = async (body: string, photos: NewForumReplyPhotoInput[]) => {
    const created = await forumService.createForumReply({ postId: post.id, body, photos })
    onReplyAdded(post.id, created)
  }

  const handlePostSave = async (values: {
    title?: string
    body: string
    newPhotos: { mimeType: string; imageBase64: string; caption?: string }[]
    removePhotoIds: string[]
  }) => {
    const updated = await forumService.updateForumPost(post.id, {
      title: values.title,
      body: values.body,
      photos: values.newPhotos,
      removePhotoIds: values.removePhotoIds,
    })
    onPostUpdated(updated)
    setIsEditing(false)
  }

  const handlePostDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    await forumService.deleteForumPost(post.id)
    onPostDeleted(post.id)
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
          {canEdit && !isEditing && (
            <span className="forum-item-actions">
              <button type="button" className="forum-reply-link" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button type="button" className="forum-reply-link" onClick={handlePostDelete}>
                Delete
              </button>
            </span>
          )}
        </div>

        {isEditing ? (
          <ForumEditForm
            initialTitle={post.title}
            initialBody={post.body}
            existingPhotos={post.photos}
            onSave={handlePostSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="forum-post-detail-body">{renderRichText(post.body)}</div>
            {post.photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.photos.map((photo) => {
                  const src = imageUrl(photo.imageId) ?? ''
                  const alt = photo.caption ?? ''
                  return (
                    <img
                      key={photo.id}
                      src={src}
                      alt={alt}
                      className="h-40 w-40 cursor-pointer object-cover"
                      onClick={() => setLightboxPhoto({ src, alt })}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
        <ThanksButton count={post.thanksCount} pressed={post.thankedByMe} onThank={handlePostThank} />

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
              onReplyUpdated={(updated) => onReplyUpdated(post.id, updated)}
              onReplyDeleted={(replyId) => onReplyDeleted(post.id, replyId)}
            />
          ))}
        </div>
      </div>
      {lightboxPhoto && (
        <PhotoLightbox src={lightboxPhoto.src} alt={lightboxPhoto.alt} onClose={() => setLightboxPhoto(null)} />
      )}
    </div>
  )
}

export default ForumPostDetail
