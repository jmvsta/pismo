import { useState } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost } from '../../services/forum/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { renderRichText } from '../../lib/richText.tsx'
import ThanksButton from './ThanksButton.tsx'
import ReplyIcon from './ReplyIcon.tsx'

interface ForumPostCardProps {
  post: ForumPost
  onOpen: (post: ForumPost) => void
  onThanked: (post: ForumPost) => void
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EXCERPT_TRUNCATE_LENGTH = 220

function ForumPostCard({ post, onOpen, onThanked }: ForumPostCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const activePhoto = post.photos[photoIndex]
  const activePhotoUrl = activePhoto ? imageUrl(activePhoto.imageId) : null
  const hasMultiplePhotos = post.photos.length > 1
  const avatarUrl = imageUrl(post.author.avatarImageId)
  const isLong = post.body.trim().length > EXCERPT_TRUNCATE_LENGTH

  const handleThank = async () => {
    const updated = await forumService.thankForumPost(post.id)
    onThanked(updated)
  }

  const showPrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((i) => (i === 0 ? post.photos.length - 1 : i - 1))
  }

  const showNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((i) => (i === post.photos.length - 1 ? 0 : i + 1))
  }

  return (
    <article className="forum-post" onClick={() => onOpen(post)}>
      <div className="forum-post-header">
        <div className={`forum-post-avatar${avatarUrl ? '' : ' photo-placeholder'}`}>
          {avatarUrl ? <img src={avatarUrl} alt={post.author.nickname} /> : <span>avatar</span>}
        </div>
        <div className="forum-post-meta">
          <span className="tag tag-accent">{post.topic.title}</span>
          <span className="text-muted">
            {post.author.nickname} · {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>
      <div className="forum-post-title">{post.title}</div>
      {activePhoto && (
        <div className={`forum-post-photo${activePhotoUrl ? '' : ' photo-placeholder'}`}>
          {activePhotoUrl ? <img src={activePhotoUrl} alt={activePhoto.caption ?? ''} /> : <span>letter photo</span>}
          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                className="forum-post-photo-nav forum-post-photo-prev"
                onClick={showPrevPhoto}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className="forum-post-photo-nav forum-post-photo-next"
                onClick={showNextPhoto}
                aria-label="Next photo"
              >
                ›
              </button>
              <div className="forum-post-photo-count">
                {photoIndex + 1} / {post.photos.length}
              </div>
            </>
          )}
        </div>
      )}
      <div className="text-muted forum-post-excerpt">{renderRichText(post.body)}</div>
      {isLong && <span className="forum-post-show-more">Show more</span>}
      <div className="forum-post-footer text-muted">
        <ThanksButton count={post.thanksCount} pressed={post.thankedByMe} onThank={handleThank} />
        <span className="forum-reply-count">
          <ReplyIcon />
          {post.replyCount}
        </span>
      </div>
    </article>
  )
}

export default ForumPostCard
