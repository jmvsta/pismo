import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage, AboutPageBlockAlign } from '../../services/about/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { renderRichText } from './richText.tsx'
import AboutCanvas from './AboutCanvas.tsx'

function About() {
  const currentUser = useUserStore((state) => state.currentUser)
  const isAdmin = currentUser?.role === 'ADMIN'

  const [page, setPage] = useState<AboutPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const [body, setBody] = useState('')
  const [savingBody, setSavingBody] = useState(false)

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
                <code>#### Smallest heading</code>, <code>**bold**</code>, and <code>*italic*</code>. Leave a blank
                line between paragraphs.
              </p>
              <textarea
                id="about-body"
                className="input"
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
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

          <AboutCanvas
            blocks={page.blocks}
            editable={editMode}
            onAddText={async (text, x, y, width, height) =>
              setPage(await aboutService.addTextBlock(text, x, y, width, height))
            }
            onAddPhoto={async (mimeType, imageBase64, x, y, width, height) =>
              setPage(await aboutService.addPhotoBlock(mimeType, imageBase64, x, y, width, height))
            }
            onUpdateLayout={async (id, x, y, width, height) =>
              setPage(await aboutService.updateBlockLayout(id, x, y, width, height))
            }
            onUpdateAlign={async (id: string, align: AboutPageBlockAlign) =>
              setPage(await aboutService.updateBlockAlign(id, align))
            }
            onUpdateText={async (id, text) => setPage(await aboutService.updateBlockText(id, text))}
            onRemove={async (id) => setPage(await aboutService.removeBlock(id))}
          />
        </>
      )}
    </div>
  )
}

export default About
