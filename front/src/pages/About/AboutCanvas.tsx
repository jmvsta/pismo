import { useRef, useState } from 'react'
import './AboutCanvas.css'
import type { AboutPageBlock, AboutPageBlockAlign, AboutPageLanguage } from '../../services/about/index.ts'
import { pickTranslation } from '../../services/about/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { renderRichText } from '../../lib/richText.tsx'
import { useRichTextFormatting } from '../../hooks/useRichTextFormatting.ts'
import RichTextLinkPrompt from '../../components/RichTextLinkPrompt/RichTextLinkPrompt.tsx'
import EmojiPicker from '../../components/EmojiPicker/EmojiPicker.tsx'

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

function rawTextFor(block: AboutPageBlock, language: AboutPageLanguage): string {
  if (language === 'RU') return block.textRu ?? ''
  if (language === 'SRB') return block.textSrb ?? ''
  return block.textEn ?? ''
}

function displayTextFor(block: AboutPageBlock, language: AboutPageLanguage): string {
  if (block.type === 'BUTTON') return block.textEn ?? ''
  return pickTranslation(block.textEn ?? '', block.textRu, block.textSrb, language)
}

const DEFAULT_TEXT_LAYOUT = { x: 30, y: 5, width: 40, height: 15 }
const DEFAULT_PHOTO_LAYOUT = { x: 35, y: 25, width: 30, height: 30 }
const DEFAULT_BUTTON_LAYOUT = { x: 35, y: 42, width: 30, height: 10 }
const MIN_SIZE = 6
const MIN_CANVAS_HEIGHT = 10
const MAX_CANVAS_HEIGHT = 300

type DragMode = 'move' | 'resize'
type LiveLayout = { id: string; x: number; y: number; width: number; height: number }

interface AboutCanvasProps {
  height: number
  backgroundImageId: string | null
  blocks: AboutPageBlock[]
  editable: boolean
  language: AboutPageLanguage
  onAddText: (text: string, x: number, y: number, width: number, height: number) => Promise<void>
  onAddPhoto: (
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<void>
  onAddButton: (
    text: string,
    linkUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<void>
  onUpdateLayout: (id: string, x: number, y: number, width: number, height: number) => Promise<void>
  onUpdateAlign: (id: string, align: AboutPageBlockAlign) => Promise<void>
  onUpdateText: (id: string, text: string, language: AboutPageLanguage) => Promise<void>
  onUpdateLink: (id: string, linkUrl: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  onUpdateHeight: (height: number) => Promise<void>
  onUpdateBackground: (mimeType: string, imageBase64: string) => Promise<void>
  onRemoveBackground: () => Promise<void>
  onRemoveCanvas: () => Promise<void>
}

function AboutCanvas({
  height,
  backgroundImageId,
  blocks,
  editable,
  language,
  onAddText,
  onAddPhoto,
  onAddButton,
  onUpdateLayout,
  onUpdateAlign,
  onUpdateText,
  onUpdateLink,
  onRemove,
  onUpdateHeight,
  onUpdateBackground,
  onRemoveBackground,
  onRemoveCanvas,
}: AboutCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundFileInputRef = useRef<HTMLInputElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [draftLink, setDraftLink] = useState('')
  const [liveLayout, setLiveLayout] = useState<LiveLayout | null>(null)
  const [liveHeight, setLiveHeight] = useState<number | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editFormatting = useRichTextFormatting(editTextareaRef, draftText, setDraftText)

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

  const beginCanvasResize = (e: React.PointerEvent) => {
    if (!editable) return
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    const canvas = canvasRef.current
    if (!canvas) return
    const startClientY = e.clientY
    const canvasWidthPx = canvas.getBoundingClientRect().width
    const startHeight = height

    const handleMove = (moveEvent: PointerEvent) => {
      const dyPct = ((moveEvent.clientY - startClientY) / canvasWidthPx) * 100
      setLiveHeight(clamp(startHeight + dyPct, MIN_CANVAS_HEIGHT, MAX_CANVAS_HEIGHT))
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      setLiveHeight((current) => {
        if (current !== null) {
          onUpdateHeight(current).catch((err) => {
            setError(err instanceof Error ? err.message : 'Could not resize this canvas.')
          })
        }
        return null
      })
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const handleRemoveCanvas = async () => {
    setError(null)
    try {
      await onRemoveCanvas()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this canvas.')
    }
  }

  const startEditingText = (block: AboutPageBlock) => {
    setSelectedId(block.id)
    setEditingId(block.id)
    setDraftText(block.type === 'BUTTON' ? block.textEn ?? '' : rawTextFor(block, language))
    editFormatting.cancelLink()
  }

  const saveEditingText = async (block: AboutPageBlock) => {
    const text = draftText.trim()
    const previous = block.type === 'BUTTON' ? block.textEn ?? '' : rawTextFor(block, language)
    setEditingId(null)
    if (!text || text === previous) return
    try {
      await onUpdateText(block.id, text, block.type === 'BUTTON' ? 'EN' : language)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this text.')
    }
  }

  const handleEmojiInsert = (emoji: string) => {
    const cursor = editTextareaRef.current?.selectionStart ?? draftText.length
    setDraftText(draftText.slice(0, cursor) + emoji + draftText.slice(cursor))
  }

  const startEditingLink = (block: AboutPageBlock) => {
    setSelectedId(block.id)
    setEditingLinkId(block.id)
    setDraftLink(block.linkUrl ?? '')
  }

  const saveEditingLink = async (block: AboutPageBlock) => {
    const url = draftLink.trim()
    setEditingLinkId(null)
    if (!url || url === block.linkUrl) return
    try {
      await onUpdateLink(block.id, url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this link.')
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

  const handleAddButton = async () => {
    setError(null)
    try {
      await onAddButton(
        'Click me',
        'https://',
        DEFAULT_BUTTON_LAYOUT.x,
        DEFAULT_BUTTON_LAYOUT.y,
        DEFAULT_BUTTON_LAYOUT.width,
        DEFAULT_BUTTON_LAYOUT.height,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add a button.')
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

  const handlePickBackground = () => backgroundFileInputRef.current?.click()

  const handleBackgroundChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingBackground(true)
    setError(null)
    try {
      const imageBase64 = await readAsBase64(file)
      await onUpdateBackground(file.type, imageBase64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set the background image.')
    } finally {
      setUploadingBackground(false)
    }
  }

  const handleRemoveBackground = async () => {
    setError(null)
    try {
      await onRemoveBackground()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the background image.')
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
          <button type="button" className="btn btn-secondary" onClick={handleAddButton}>
            + Add button
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePickBackground}
            disabled={uploadingBackground}
          >
            {uploadingBackground ? 'Uploading…' : backgroundImageId ? 'Change background' : '+ Set background'}
          </button>
          {backgroundImageId && (
            <button type="button" className="btn btn-secondary" onClick={handleRemoveBackground}>
              Remove background
            </button>
          )}
          <input
            ref={backgroundFileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleBackgroundChosen}
            hidden
          />
          <button
            type="button"
            className="btn btn-secondary ml-auto text-[var(--color-accent)]"
            onClick={handleRemoveCanvas}
          >
            Remove canvas
          </button>
        </div>
      )}

      <div
        ref={canvasRef}
        className={
          editable
            ? 'about-canvas relative w-full border border-dashed border-[var(--color-divider)]'
            : 'about-canvas relative w-full'
        }
        style={{
          aspectRatio: `100 / ${liveHeight ?? height}`,
          containerType: 'inline-size',
          backgroundImage: backgroundImageId ? `url(${imageUrl(backgroundImageId)})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
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
                  <div
                    className="relative h-full w-full"
                    onBlur={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return
                      saveEditingText(block)
                    }}
                  >
                    <textarea
                      ref={editTextareaRef}
                      className="input h-full w-full resize-none"
                      autoFocus
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      onKeyDown={editFormatting.handleKeyDown}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <div
                      className="absolute flex flex-col gap-1"
                      style={{ top: -34, left: 0, zIndex: 101 }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 bg-[var(--color-bg)] p-1 shadow-sm">
                        <EmojiPicker onSelect={handleEmojiInsert} />
                      </div>
                      {editFormatting.linkPromptOpen && (
                        <RichTextLinkPrompt
                          url={editFormatting.linkUrl}
                          onUrlChange={editFormatting.setLinkUrl}
                          onConfirm={editFormatting.confirmLink}
                          onCancel={editFormatting.cancelLink}
                        />
                      )}
                    </div>
                  </div>
                ) : block.type === 'BUTTON' ? (
                  <a
                    href={block.linkUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="about-canvas-button-block flex h-full w-full items-center justify-center overflow-hidden text-center no-underline"
                    onClick={(e) => {
                      if (editable) e.preventDefault()
                    }}
                    onDoubleClick={() => editable && startEditingText(block)}
                  >
                    {displayTextFor(block, language)}
                  </a>
                ) : (
                  <div
                    className="about-canvas-block-text h-full w-full overflow-hidden text-sm leading-relaxed [&_*]:m-0"
                    style={{ textAlign: textAlignFor(block.align) }}
                    onDoubleClick={() => editable && startEditingText(block)}
                  >
                    {renderRichText(displayTextFor(block, language))}
                  </div>
                )}
              </div>

              {editingLinkId === block.id && (
                <div
                  className="absolute z-[101]"
                  style={{ top: -34, left: 0 }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <RichTextLinkPrompt
                    url={draftLink}
                    onUrlChange={setDraftLink}
                    onConfirm={() => saveEditingLink(block)}
                    onCancel={() => setEditingLinkId(null)}
                  />
                </div>
              )}

              {isSelected && !isEditingText && editingLinkId !== block.id && (
                <>
                  <div
                    className="absolute flex gap-1 bg-[var(--color-bg)] p-1 shadow-sm"
                    style={{ top: -34, left: 0 }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {(block.type === 'TEXT' || block.type === 'BUTTON') && (
                      <button
                        type="button"
                        className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                        onClick={() => startEditingText(block)}
                      >
                        Edit
                      </button>
                    )}
                    {block.type === 'BUTTON' && (
                      <button
                        type="button"
                        className="border border-[var(--color-divider)] px-2 py-1 text-[11px]"
                        onClick={() => startEditingLink(block)}
                      >
                        Link
                      </button>
                    )}
                    {block.type !== 'BUTTON' && (
                      <>
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
                      </>
                    )}
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

        {editable && (
          <div
            className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-center justify-center"
            style={{ touchAction: 'none' }}
            onPointerDown={beginCanvasResize}
          >
            <div className="h-1 w-10 bg-[var(--color-accent)]" />
          </div>
        )}
      </div>

      {error && <p className="text-muted">{error}</p>}
    </div>
  )
}

export default AboutCanvas
