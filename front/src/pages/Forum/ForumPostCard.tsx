import type { ForumPost } from '../../services/forum/index.ts'

interface ForumPostCardProps {
  post: ForumPost
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

function ForumPostCard({ post }: ForumPostCardProps) {
  const coverPhoto = post.photos[0]

  return (
    <article className="forum-post">
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
        <span>{post.thanksCount} thanks</span>
      </div>
    </article>
  )
}

export default ForumPostCard
