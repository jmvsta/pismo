import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage, AboutPageBlockAlign } from '../../services/about/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import AboutCanvas from './AboutCanvas.tsx'
import { aboutEditText } from './aboutEditText.ts'
import { uiText } from '../../i18n/uiText.ts'

const FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function About() {
  const currentUser = useUserStore((state) => state.currentUser)
  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'

  const language = useLanguageStore((state) => state.language)

  const [page, setPage] = useState<AboutPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [clipboardBlockId, setClipboardBlockId] = useState<string | null>(null)
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleBlockSelected = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
    // A toolbar field left focused would swallow Ctrl+C / Ctrl+V; selecting a block takes focus off it.
    const focused = document.activeElement
    if (focused instanceof HTMLElement && FIELD_TAGS.has(focused.tagName)) focused.blur()
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Ctrl/Cmd+C copies the selected block; Ctrl/Cmd+V pastes it onto the canvas last clicked in
  // (falling back to the selected block's canvas, then the source's). Typing in a field and
  // copying highlighted text keep their normal behavior.
  useEffect(() => {
    if (!editMode || !page) return
    const canvasOf = (blockId: string | null) =>
      blockId ? page.canvases.find((canvas) => canvas.blocks.some((block) => block.id === blockId))?.id ?? null : null

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
      const key = event.key.toLowerCase()
      if (key !== 'c' && key !== 'v') return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || FIELD_TAGS.has(target.tagName))) return

      if (key === 'c') {
        if (window.getSelection()?.toString() || !canvasOf(selectedBlockId)) return
        event.preventDefault()
        setClipboardBlockId(selectedBlockId)
        setNotice(aboutEditText('blockCopied', language))
        return
      }

      const targetCanvasId = activeCanvasId ?? canvasOf(selectedBlockId) ?? canvasOf(clipboardBlockId)
      if (!clipboardBlockId || !targetCanvasId) return
      event.preventDefault()
      setError(null)
      aboutService
        .copyBlock(clipboardBlockId, targetCanvasId)
        .then((result) => {
          setPage(result)
          setNotice(null)
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not paste the block.'))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editMode, page, selectedBlockId, clipboardBlockId, activeCanvasId, language])

  useEffect(() => {
    let cancelled = false
    aboutService
      .aboutPage()
      .then((result) => {
        if (!cancelled) setPage(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this page.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 pt-6 pb-12 sm:px-10 sm:pt-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="mb-0 inline-block text-[13px] text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]"
        >
          {uiText('backToFeed', language)}
        </Link>
        {canModerate && (
          <button
            type="button"
            className="btn btn-secondary text-base px-4 py-2"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? aboutEditText('doneEditing', language) : aboutEditText('editPage', language)}
          </button>
        )}
      </div>

      {notice && <p className="text-muted text-sm">{notice}</p>}
      {error && <p className="text-muted">{error}</p>}
      {!error && !page && <p className="text-muted">Loading…</p>}

      {page && (
        <>
          {page.canvases.map((canvas, index) => (
            <AboutCanvas
              key={canvas.id}
              height={canvas.height}
              backgroundImageId={canvas.backgroundImageId}
              rounded={canvas.rounded}
              bordered={canvas.bordered}
              blocks={canvas.blocks}
              editable={editMode}
              language={language}
              canMoveUp={index > 0}
              canMoveDown={index < page.canvases.length - 1}
              onActivate={() => setActiveCanvasId(canvas.id)}
              onBlockSelected={handleBlockSelected}
              onMove={async (direction) => setPage(await aboutService.moveCanvas(canvas.id, direction))}
              onAddText={async (text, x, y, width, height) =>
                setPage(await aboutService.addTextBlock(canvas.id, text, x, y, width, height))
              }
              onAddPhoto={async (mimeType, imageBase64, x, y, width, height) =>
                setPage(await aboutService.addPhotoBlock(canvas.id, mimeType, imageBase64, x, y, width, height))
              }
              onAddButton={async (text, linkUrl, x, y, width, height) =>
                setPage(await aboutService.addButtonBlock(canvas.id, text, linkUrl, x, y, width, height))
              }
              onAddGallery={async (x, y, width, height, slideIntervalSeconds) =>
                setPage(await aboutService.addGalleryBlock(canvas.id, x, y, width, height, slideIntervalSeconds))
              }
              onAddGalleryPhoto={async (blockId, mimeType, imageBase64) =>
                setPage(await aboutService.addGalleryPhoto(blockId, mimeType, imageBase64))
              }
              onRemoveGalleryPhoto={async (blockId, imageId) =>
                setPage(await aboutService.removeGalleryPhoto(blockId, imageId))
              }
              onUpdateGalleryInterval={async (id, slideIntervalSeconds) =>
                setPage(await aboutService.updateGalleryInterval(id, slideIntervalSeconds))
              }
              onUpdateLayout={async (id, x, y, width, height) =>
                setPage(await aboutService.updateBlockLayout(id, x, y, width, height))
              }
              onUpdateAlign={async (id: string, align: AboutPageBlockAlign) =>
                setPage(await aboutService.updateBlockAlign(id, align))
              }
              onUpdateLayer={async (id, layer) => setPage(await aboutService.updateBlockLayer(id, layer))}
              onUpdateRounded={async (rounded) => setPage(await aboutService.updateCanvasRounded(canvas.id, rounded))}
              onUpdateBlockRounded={async (id, rounded) =>
                setPage(await aboutService.updateBlockRounded(id, rounded))
              }
              onUpdateBordered={async (bordered) =>
                setPage(await aboutService.updateCanvasBordered(canvas.id, bordered))
              }
              onUpdateBlockHighlighted={async (id, highlighted) =>
                setPage(await aboutService.updateBlockHighlighted(id, highlighted))
              }
              onUpdateBlockIcon={async (id, icon) => setPage(await aboutService.updateBlockIcon(id, icon))}
              onUpdateBlockFont={async (id, fontSize, fontFamily) =>
                setPage(await aboutService.updateBlockFont(id, fontSize, fontFamily))
              }
              onUpdateText={async (id, text, textLanguage) =>
                setPage(await aboutService.updateBlockText(id, text, textLanguage))
              }
              onUpdateLink={async (id, linkUrl) => setPage(await aboutService.updateBlockLink(id, linkUrl))}
              onRemove={async (id) => setPage(await aboutService.removeBlock(id))}
              onUpdateHeight={async (height) => setPage(await aboutService.updateCanvasHeight(canvas.id, height))}
              onUpdateBackground={async (mimeType, imageBase64) =>
                setPage(await aboutService.updateCanvasBackground(canvas.id, mimeType, imageBase64))
              }
              onRemoveBackground={async () => setPage(await aboutService.removeCanvasBackground(canvas.id))}
              onRemoveCanvas={async () => setPage(await aboutService.removeCanvas(canvas.id))}
            />
          ))}

          {editMode && (
            <button
              type="button"
              className="btn btn-secondary self-start"
              onClick={async () => {
                setError(null)
                try {
                  setPage(await aboutService.addCanvas())
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not add a canvas.')
                }
              }}
            >
              {aboutEditText('addCanvas', language)}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default About
