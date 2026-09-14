import { useState, type FormEvent } from 'react'
import { imageUrl } from '../../services/imageUrl.ts'
import PhotoAttachments, { type PendingPhoto } from '../../components/PhotoAttachments/PhotoAttachments.tsx'

interface ExistingPhoto {
  id: string
  imageId: string
  caption: string | null
}

export interface ForumEditFormValues {
  title?: string
  body: string
  newPhotos: { mimeType: string; imageBase64: string; caption?: string }[]
  removePhotoIds: string[]
}

interface ForumEditFormProps {
  initialTitle?: string
  initialBody: string
  existingPhotos: ExistingPhoto[]
  onSave: (values: ForumEditFormValues) => Promise<void>
  onCancel: () => void
}

function ForumEditForm({ initialTitle, initialBody, existingPhotos, onSave, onCancel }: ForumEditFormProps) {
  const [title, setTitle] = useState(initialTitle ?? '')
  const [body, setBody] = useState(initialBody)
  const [keptPhotoIds, setKeptPhotoIds] = useState(() => new Set(existingPhotos.map((photo) => photo.id)))
  const [newPhotos, setNewPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleRemove = (photoId: string) => {
    setKeptPhotoIds((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (body.trim() === '' || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSave({
        title: initialTitle !== undefined ? title : undefined,
        body,
        newPhotos: newPhotos.map(({ mimeType, imageBase64 }) => ({ mimeType, imageBase64 })),
        removePhotoIds: existingPhotos.filter((photo) => !keptPhotoIds.has(photo.id)).map((photo) => photo.id),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes.')
      setSubmitting(false)
    }
  }

  return (
    <form className="forum-edit-form" onSubmit={handleSubmit}>
      {initialTitle !== undefined && (
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      )}
      <textarea
        className="input"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Body"
      />
      {existingPhotos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map((photo) => {
            const kept = keptPhotoIds.has(photo.id)
            return (
              <div key={photo.id} className="relative">
                <img
                  src={imageUrl(photo.imageId) ?? ''}
                  alt={photo.caption ?? ''}
                  className="h-20 w-20 object-cover"
                  style={{ opacity: kept ? 1 : 0.35 }}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 btn btn-icon"
                  onClick={() => toggleRemove(photo.id)}
                  aria-label={kept ? 'Remove photo' : 'Keep photo'}
                  disabled={submitting}
                >
                  {kept ? '×' : '↺'}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <PhotoAttachments photos={newPhotos} onChange={setNewPhotos} disabled={submitting} />
      {error && <p className="text-muted">{error}</p>}
      <div className="forum-reply-composer-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-secondary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default ForumEditForm
