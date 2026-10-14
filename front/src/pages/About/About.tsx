import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage, AboutPageBlockAlign } from '../../services/about/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import AboutCanvas from './AboutCanvas.tsx'
import { aboutEditText } from './aboutEditText.ts'
import { uiText } from '../../i18n/uiText.ts'

function About() {
  const currentUser = useUserStore((state) => state.currentUser)
  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'

  const language = useLanguageStore((state) => state.language)

  const [page, setPage] = useState<AboutPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

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
