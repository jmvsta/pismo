import { useRef, useState, type FormEvent } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumTopic } from '../../services/forum/index.ts'
import EmojiPicker from '../../components/EmojiPicker/EmojiPicker.tsx'
import PhotoAttachments, { type PendingPhoto } from '../../components/PhotoAttachments/PhotoAttachments.tsx'

interface ForumNewPostDialogProps {
  topics: ForumTopic[]
  onClose: () => void
  onCreated: (post: ForumPost) => void
}

function ForumNewPostDialog({ topics, onClose, onCreated }: ForumNewPostDialogProps) {
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const canSubmit = topicId !== '' && title.trim() !== '' && body.trim() !== '' && !submitting

  const handleEmojiSelect = (emoji: string) => {
    const cursor = bodyRef.current?.selectionStart ?? body.length
    setBody(body.slice(0, cursor) + emoji + body.slice(cursor))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const post = await forumService.createForumPost({
        topicId,
        title,
        body,
        photos: photos.map(({ mimeType, imageBase64 }) => ({ mimeType, imageBase64 })),
      })
      onCreated(post)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the post.')
      setSubmitting(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <form className="forum-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="forum-modal-header">
          <h5>New post</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="field">
          <label htmlFor="forum-new-post-topic">Topic</label>
          <select
            id="forum-new-post-topic"
            className="input"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="forum-new-post-title">Title</label>
          <input
            id="forum-new-post-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
          />
        </div>

        <div className="field">
          <label htmlFor="forum-new-post-body">Body</label>
          <textarea
            id="forum-new-post-body"
            className="input"
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>

        <PhotoAttachments photos={photos} onChange={setPhotos} disabled={submitting} />

        {error && <p className="text-muted">{error}</p>}

        <div className="forum-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? 'Posting…' : 'Post →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ForumNewPostDialog
