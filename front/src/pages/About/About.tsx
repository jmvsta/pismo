import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aboutService } from '../../services/about/index.ts'
import type { AboutPage } from '../../services/about/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { renderRichText } from './richText.tsx'

function About() {
  const [page, setPage] = useState<AboutPage | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <Link to="/" className="text-[var(--color-accent)] no-underline hover:underline">
        ← Back to feed
      </Link>

      {error && <p className="text-muted">{error}</p>}
      {!error && !page && <p className="text-muted">Loading…</p>}

      {page && (
        <>
          <div className="flex flex-col gap-4 leading-relaxed">{renderRichText(page.body)}</div>

          {page.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {page.photos.map((photo) => (
                <figure key={photo.id} className="m-0 flex flex-col gap-1">
                  <img
                    src={imageUrl(photo.imageId) ?? undefined}
                    alt={photo.caption ?? ''}
                    className="aspect-square w-full object-cover"
                  />
                  {photo.caption && <figcaption className="text-muted text-sm">{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default About
