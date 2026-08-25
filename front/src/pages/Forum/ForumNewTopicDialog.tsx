import { useState, type FormEvent } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumTopic } from '../../services/forum/index.ts'

interface ForumNewTopicDialogProps {
  onClose: () => void
  onCreated: (topic: ForumTopic) => void
}

function ForumNewTopicDialog({ onClose, onCreated }: ForumNewTopicDialogProps) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = code.trim() !== '' && title.trim() !== '' && !submitting

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const topic = await forumService.createForumTopic({
        code: code.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
      })
      onCreated(topic)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the topic.')
      setSubmitting(false)
    }
  }

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <form className="forum-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="forum-modal-header">
          <h5>New topic</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="field">
          <label htmlFor="forum-new-topic-code">Code</label>
          <input
            id="forum-new-topic-code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="pen_pal_search"
          />
        </div>

        <div className="field">
          <label htmlFor="forum-new-topic-title">Title</label>
          <input
            id="forum-new-topic-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pen pal search"
          />
        </div>

        <div className="field">
          <label htmlFor="forum-new-topic-description">Description (optional)</label>
          <textarea
            id="forum-new-topic-description"
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-muted">{error}</p>}

        <div className="forum-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? 'Creating…' : 'Create topic →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ForumNewTopicDialog
