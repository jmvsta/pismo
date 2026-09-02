import { useRef, useState } from 'react'
import type { AboutPageBlock, AboutPageBlockAlign } from '../../services/about/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { renderRichText } from './richText.tsx'

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function objectPositionFor(align: AboutPageBlockAlign): string {
  if (align === 'LEFT') return 'left center'
  if (align === 'RIGHT') return 'right center'
  return 'center center'
}

function textAlignFor(align: AboutPageBlockAlign): 'left' | 'center' | 'right' {
  return align.toLowerCase() as 'left' | 'center' | 'right'
}

const DEFAULT_TEXT_LAYOUT = { x: 30, y: 5, width: 40, height: 15 }
const DEFAULT_PHOTO_LAYOUT = { x: 35, y: 25, width: 30, height: 30 }
const MIN_SIZE = 6

type DragMode = 'move' | 'resize'
type LiveLayout = { id: string; x: number; y: number; width: number; height: number }

interface AboutCanvasProps {
  blocks: AboutPageBlock[]
  editable: boolean
  onAddText: (text: string, x: number, y: number, width: number, height: number) => Promise<void>
  onAddPhoto: (
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<void>
  onUpdateLayout: (id: string, x: number, y: number, width: number, height: number) => Promise<void>
  onUpdateAlign: (id: string, align: AboutPageBlockAlign) => Promise<void>
  onUpdateText: (id: string, text: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

function AboutCanvas({
  blocks,
  editable,
  onAddText,
  onAddPhoto,
  onUpdateLayout,
  onUpdateAlign,
  onUpdateText,
  onRemove,
}: AboutCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [liveLayout, setLiveLayout] = useState<LiveLayout | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!editable && blocks.length === 0) return null

  const layoutFor = (block: AboutPageBlock) => (liveLayout?.id === block.id ? liveLayout : block)

  const beginDrag = (block: AboutPageBlock, mode: DragMode) => (e: React.PointerEvent) => {
    if (!editable || editingId === block.id) return
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setSelectedId(block.id)

    const canvas = canvasRef.current
    if (!canvas) return
    const startClientX = e.clientX
    const startClientY = e.clientY
    const { x: startX, y: startY, width: startWidth, height: startHeight } = block

    const handleMove = (moveEvent: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const dxPct = ((moveEvent.clientX - startClientX) / rect.width) * 100
      const dyPct = ((moveEvent.clientY - startClientY) / rect.height) * 100
      if (mode === 'move') {
        setLiveLayout({
          id: block.id,
          x: clamp(startX + dxPct, 0, 100 - startWidth),
          y: clamp(startY + dyPct, 0, 100 - startHeight),
          width: startWidth,
          height: startHeight,
        })
      } else {
        setLiveLayout({
          id: block.id,
          x: startX,
          y: startY,
          width: clamp(startWidth + dxPct, MIN_SIZE, 100 - startX),
          height: clamp(startHeight + dyPct, MIN_SIZE, 100 - startY),
        })
      }
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      setLiveLayout((current) => {
        if (current?.id === block.id) {
          onUpdateLayout(current.id, current.x, current.y, current.width, current.height).catch((err) => {
            setError(err instanceof Error ? err.message : 'Could not move this block.')
          })
        }
        return null
      })
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const startEditingText = (block: AboutPageBlock) => {
    setSelectedId(block.id)
    setEditingId(block.id)
    setDraftText(block.text ?? '')
  }

  const saveEditingText = async (block: AboutPageBlock) => {
    const text = draftText.trim()
    setEditingId(null)
    if (!text || text === block.text) return
    try {
      await onUpdateText(block.id, text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this text.')
    }
  }

  const handleAddText = async () => {
    setError(null)
    try {
      await onAddText('New text', DEFAULT_TEXT_LAYOUT.x, DEFAULT_TEXT_LAYOUT.y, DEFAULT_TEXT_LAYOUT.width, DEFAULT_TEXT_LAYOUT.height)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add a text block.')
    }
  }

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingPhoto(true)
    setError(null)
    try {
      const imageBase64 = await readAsBase64(file)
      await onAddPhoto(
        file.type,
        imageBase64,
        DEFAULT_PHOTO_LAYOUT.x,
        DEFAULT_PHOTO_LAYOUT.y,
        DEFAULT_PHOTO_LAYOUT.width,
        DEFAULT_PHOTO_LAYOUT.height,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload this photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemove = async (id: string) => {
    setError(null)
    setSelectedId(null)
    setEditingId(null)
    try {
      await onRemove(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this block.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleAddText}>
            + Add text
          </button>
          <button type="button" className="btn btn-secondary" onClick={handlePickPhoto} disabled={uploadingPhoto}>
            {uploadingPhoto ? 'Uploading…' : '+ Add photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handlePhotoChosen}
            hidden
          />
        </div>
      )}

      <div
        ref={canvasRef}
        className={editable ? 'relative w-full border border-dashed border-[var(--color-divider)]' : 'relative w-full'}
        style={{ aspectRatio: '16 / 9' }}
        onPointerDown={() => editable && setSelectedId(null)}
      >
        {blocks.map((block) => {
          const layout = layoutFor(block)
          const isSelected = editable && selectedId === block.id
          const isEditingText = editingId === block.id

          return (
            <div
              key={block.id}
              className={
                editable
                  ? `absolute border ${isSelected ? 'border-[var(--color-accent)]' : 'border-[var(--color-divider)]'}`
                  : 'absolute'
              }
              style={{
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                width: `${layout.width}%`,
                height: `${layout.height}%`,
                zIndex: isSelected ? 100 : undefined,
                touchAction: 'none',
                cursor: editable && !isEditingText ? 'move' : undefined,
              }}
              onPointerDown={beginDrag(block, 'move')}
            >
              <div className="h-full w-full overflow-hidden">
                {block.type === 'PHOTO' ? (
                  <img
                    src={imageUrl(block.imageId) ?? undefined}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: objectPositionFor(block.align) }}
                    draggable={false}
                  />
                ) : isEditingText ? (
                  <textarea
                    className="input h-full w-full resize-none"
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={() => saveEditingText(block)}
                  />
                ) : (
                  <div
                    className="h-full w-full overflow-hidden p-2 text-sm leading-relaxed [&_*]:m-0"
                    style={{ textAlign: textAlignFor(block.align) }}
                    onDoubleClick={() => editable && startEditingText(block)}
                  >
                    {renderRichText(block.text ?? '')}
                  </div>
                )}
              </div>

              {isSelected && !isEditingText && (
                <>
                  <div
                    className="absolute flex gap-1 bg-[var(--color-bg)] p-1 shadow-sm"
                    style={{ top: -34, left: 0 }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {block.type === 'TEXT' && (
                      <button
                        type="button"
                        className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                        onClick={() => startEditingText(block)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                      onClick={() => onUpdateAlign(block.id, 'LEFT')}
                    >
                      ⟵
                    </button>
                    <button
                      type="button"
                      className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                      onClick={() => onUpdateAlign(block.id, 'CENTER')}
                    >
                      ⟷
                    </button>
                    <button
                      type="button"
                      className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                      onClick={() => onUpdateAlign(block.id, 'RIGHT')}
                    >
                      ⟶
                    </button>
                    <button
                      type="button"
                      className="border border-[var(--color-divider)] px-2 py-1 text-[11px] text-[var(--color-accent)]"
                      onClick={() => handleRemove(block.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div
                    className="absolute h-4 w-4 cursor-nwse-resize bg-[var(--color-accent)]"
                    style={{ right: 0, bottom: 0, touchAction: 'none' }}
                    onPointerDown={beginDrag(block, 'resize')}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-muted">{error}</p>}
    </div>
  )
}

export default AboutCanvas
