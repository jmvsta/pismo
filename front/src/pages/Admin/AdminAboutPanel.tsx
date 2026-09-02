import { useEffect, useRef, useState } from 'react'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage } from '../../services/about/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function AdminAboutPanel() {
  const [page, setPage] = useState<AboutPage | null>(null)
  const [body, setBody] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingBody, setSavingBody] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    aboutService
      .aboutPage()
      .then((result) => {
        if (cancelled) return
        setPage(result)
        setBody(result.body)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the about page.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveBody = async () => {
    setSavingBody(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await aboutService.updateBody(body)
      setPage(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the text.')
    } finally {
      setSavingBody(false)
    }
  }

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingPhoto(true)
    setError(null)
    try {
      const imageBase64 = await readAsBase64(file)
      const updated = await aboutService.addPhoto(file.type, imageBase64, caption || undefined)
      setPage(updated)
      setCaption('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload this photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async (id: string) => {
    setError(null)
    try {
      const updated = await aboutService.removePhoto(id)
      setPage(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this photo.')
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="about-body" className="font-semibold">
          Page text
        </label>
        <p className="text-muted text-sm">
          Supports <code># Heading</code>, <code>## Subheading</code>, <code>**bold**</code>, and{' '}
          <code>*italic*</code>. Leave a blank line between paragraphs.
        </p>
        <textarea
          id="about-body"
          className="input"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="button" className="btn btn-primary self-start" onClick={handleSaveBody} disabled={savingBody}>
          {savingBody ? 'Saving…' : 'Save text'}
        </button>
        {saved && !savingBody && <span className="text-muted text-sm">Saved</span>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">Photos</span>

        {page && page.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {page.photos.map((photo) => (
              <div key={photo.id} className="flex flex-col gap-1">
                <img
                  src={imageUrl(photo.imageId) ?? undefined}
                  alt={photo.caption ?? ''}
                  className="aspect-square w-full object-cover"
                />
                {photo.caption && <span className="text-muted text-xs">{photo.caption}</span>}
                <button type="button" className="btn btn-ghost" onClick={() => handleRemovePhoto(photo.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <label htmlFor="about-photo-caption">Caption (optional)</label>
          <input
            id="about-photo-caption"
            className="input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? 'Uploading…' : '+ Add photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleAddPhoto}
          hidden
        />
      </div>

      {error && <p className="text-muted">{error}</p>}
    </div>
  )
}

export default AdminAboutPanel
