import { forumService } from '../../services/forum/index.ts'
import type { ForumPost } from '../../services/forum/index.ts'
import ThanksButton from './ThanksButton.tsx'

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

function ForumPostCard({ post, onOpen, onThanked }: ForumPostCardProps) {
  const coverPhoto = post.photos[0]

  const handleThank = async () => {
    const updated = await forumService.thankForumPost(post.id)
    onThanked(updated)
  }

  return (
    <article className="forum-post" onClick={() => onOpen(post)}>
      <div className="forum-post-meta">
        <span className="tag tag-accent">{post.topic.title}</span>
        <span className="text-muted">
          {post.author.nickname} · {formatRelativeTime(post.createdAt)}
        </span>
      </div>
      <div className="forum-post-title">{post.title}</div>
      <div className="forum-post-content">
        <p className="text-muted forum-post-excerpt">{post.body}</p>
        {coverPhoto && (
          <div className="photo-placeholder forum-post-photo">
            {coverPhoto.url ? <img src={coverPhoto.url} alt={coverPhoto.caption ?? ''} /> : <span>letter photo</span>}
          </div>
        )}
      </div>
      <div className="forum-post-footer text-muted">
        <span>{post.replyCount} replies</span>
        <ThanksButton count={post.thanksCount} onThank={handleThank} />
      </div>
    </article>
  )
}

export default ForumPostCard
