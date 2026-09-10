import { useRef, useState, type FormEvent } from 'react'
import type { NewForumReplyPhotoInput } from '../../services/forum/index.ts'
import EmojiPicker from '../../components/EmojiPicker/EmojiPicker.tsx'
import PhotoAttachments, { type PendingPhoto } from '../../components/PhotoAttachments/PhotoAttachments.tsx'

interface ForumReplyComposerProps {
  placeholder?: string
  submitLabel?: string
  onSubmit: (body: string, photos: NewForumReplyPhotoInput[]) => Promise<void>
  onCancel?: () => void
}

function ForumReplyComposer({ placeholder, submitLabel = 'Reply →', onSubmit, onCancel }: ForumReplyComposerProps) {
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const handleEmojiSelect = (emoji: string) => {
    const cursor = bodyRef.current?.selectionStart ?? body.length
    setBody(body.slice(0, cursor) + emoji + body.slice(cursor))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (body.trim() === '' || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(
        body,
        photos.map(({ mimeType, imageBase64 }) => ({ mimeType, imageBase64 })),
      )
      setBody('')
      setPhotos([])
      onCancel?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post the reply.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="forum-reply-composer" onSubmit={handleSubmit}>
      <textarea
        className="input"
        ref={bodyRef}
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? 'Write a reply…'}
      />
      <EmojiPicker onSelect={handleEmojiSelect} />
      <PhotoAttachments photos={photos} onChange={setPhotos} disabled={submitting} />
      {error && <p className="text-muted">{error}</p>}
      <div className="forum-reply-composer-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-secondary" disabled={submitting}>
          {submitting ? 'Posting…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ForumReplyComposer
