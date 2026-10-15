import { useState, type ChangeEvent } from 'react'
import { prepareImageForUpload } from '../../lib/prepareImage.ts'

export interface PendingPhoto {
  mimeType: string
  imageBase64: string
  previewUrl: string
}

const ACCEPTED_TYPES = 'image/png, image/jpeg, image/webp, image/gif'
const PHOTO_MAX_SIDE = 1600

interface PhotoAttachmentsProps {
  photos: PendingPhoto[]
  onChange: (photos: PendingPhoto[]) => void
  disabled?: boolean
}

function PhotoAttachments({ photos, onChange, disabled }: PhotoAttachmentsProps) {
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setError(null)
    try {
      const added = await Promise.all(
        files.map(async (file) => {
          const { mimeType, imageBase64 } = await prepareImageForUpload(file, { maxSide: PHOTO_MAX_SIDE })
          return { mimeType, imageBase64, previewUrl: URL.createObjectURL(file) }
        }),
      )
      onChange([...photos, ...added])
    } catch {
      setError('Could not read one of the selected photos.')
    }
  }

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="btn btn-ghost w-fit cursor-pointer">
        <span>+ Add photos</span>
        <input
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          disabled={disabled}
          onChange={handleFilesSelected}
          className="hidden"
        />
      </label>
      {error && <p className="text-muted">{error}</p>}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div key={photo.previewUrl} className="relative">
              <img src={photo.previewUrl} alt="" className="h-20 w-20 object-cover" />
              <button
                type="button"
                className="absolute -top-2 -right-2 btn btn-icon"
                onClick={() => handleRemove(index)}
                aria-label="Remove photo"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoAttachments
