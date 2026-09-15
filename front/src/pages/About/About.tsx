import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage, AboutPageBlockAlign } from '../../services/about/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { renderRichText } from '../../lib/richText.tsx'
import { useRichTextFormatting } from '../../hooks/useRichTextFormatting.ts'
import RichTextLinkPrompt from '../../components/RichTextLinkPrompt/RichTextLinkPrompt.tsx'
import AboutCanvas from './AboutCanvas.tsx'

function About() {
  const currentUser = useUserStore((state) => state.currentUser)
  const isAdmin = currentUser?.role === 'ADMIN'

  const [page, setPage] = useState<AboutPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const [body, setBody] = useState('')
  const [savingBody, setSavingBody] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const bodyFormatting = useRichTextFormatting(bodyRef, body, setBody)

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
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this page.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveBody = async () => {
    setSavingBody(true)
    setError(null)
    try {
      setPage(await aboutService.updateBody(body))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the text.')
    } finally {
      setSavingBody(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 pt-6 pb-12 sm:px-10 sm:pt-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="mb-0 inline-block text-[13px] text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]"
        >
          ← Back to feed
        </Link>
        {isAdmin && (
          <button type="button" className="btn btn-secondary" onClick={() => setEditMode((v) => !v)}>
            {editMode ? 'Done editing' : 'Edit page'}
          </button>
        )}
      </div>

      {error && <p className="text-muted">{error}</p>}
      {!error && !page && <p className="text-muted">Loading…</p>}

      {page && (
        <>
          {editMode ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="about-body" className="font-semibold">
                Page text
              </label>
              <p className="text-muted text-sm">
                Supports <code># Heading</code>, <code>## Subheading</code>, <code>### Subheading</code>,{' '}
                <code>#### Smallest heading</code>, <code>**bold**</code>, <code>*italic*</code>,{' '}
                <code>&lt;s&gt;strikethrough&lt;/s&gt;</code>, <code>&lt;u&gt;underline&lt;/u&gt;</code>, and{' '}
                <code>&lt;a href='https://...'&gt;link&lt;/a&gt;</code> (also <code>mailto:</code>). Leave a blank
                line between paragraphs. Select text and press ctrl/cmd+b/i/u/s to format it, or ctrl/cmd+a to link
                it.
              </p>
              <textarea
                id="about-body"
                ref={bodyRef}
                className="input"
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={bodyFormatting.handleKeyDown}
              />
              {bodyFormatting.linkPromptOpen && (
                <RichTextLinkPrompt
                  url={bodyFormatting.linkUrl}
                  onUrlChange={bodyFormatting.setLinkUrl}
                  onConfirm={bodyFormatting.confirmLink}
                  onCancel={bodyFormatting.cancelLink}
                />
              )}
              <button
                type="button"
                className="btn btn-primary self-start"
                onClick={handleSaveBody}
                disabled={savingBody}
              >
                {savingBody ? 'Saving…' : 'Save text'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 leading-relaxed">{renderRichText(page.body)}</div>
          )}

          {page.canvases.map((canvas) => (
            <AboutCanvas
              key={canvas.id}
              height={canvas.height}
              backgroundImageId={canvas.backgroundImageId}
              blocks={canvas.blocks}
              editable={editMode}
              onAddText={async (text, x, y, width, height) =>
                setPage(await aboutService.addTextBlock(canvas.id, text, x, y, width, height))
              }
              onAddPhoto={async (mimeType, imageBase64, x, y, width, height) =>
                setPage(await aboutService.addPhotoBlock(canvas.id, mimeType, imageBase64, x, y, width, height))
              }
              onAddButton={async (text, linkUrl, x, y, width, height) =>
                setPage(await aboutService.addButtonBlock(canvas.id, text, linkUrl, x, y, width, height))
              }
              onUpdateLayout={async (id, x, y, width, height) =>
                setPage(await aboutService.updateBlockLayout(id, x, y, width, height))
              }
              onUpdateAlign={async (id: string, align: AboutPageBlockAlign) =>
                setPage(await aboutService.updateBlockAlign(id, align))
              }
              onUpdateText={async (id, text) => setPage(await aboutService.updateBlockText(id, text))}
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
              + Add canvas
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default About
