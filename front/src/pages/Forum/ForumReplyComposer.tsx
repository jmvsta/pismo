import { useState, type FormEvent } from 'react'

interface ForumReplyComposerProps {
  placeholder?: string
  submitLabel?: string
  onSubmit: (body: string) => Promise<void>
  onCancel?: () => void
}

function ForumReplyComposer({ placeholder, submitLabel = 'Reply →', onSubmit, onCancel }: ForumReplyComposerProps) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (body.trim() === '' || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(body)
      setBody('')
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
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? 'Write a reply…'}
      />
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
