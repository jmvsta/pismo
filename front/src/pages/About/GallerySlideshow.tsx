import { useEffect, useState } from 'react'
import { imageUrl } from '../../services/imageUrl.ts'

interface GallerySlideshowProps {
  imageIds: string[]
  intervalSeconds: number
  objectPosition: string
  emptyLabel?: string
}

function GallerySlideshow({ imageIds, intervalSeconds, objectPosition, emptyLabel }: GallerySlideshowProps) {
  const [index, setIndex] = useState(0)
  const count = imageIds.length

  useEffect(() => {
    if (count < 2) return
    const timer = window.setInterval(() => setIndex((i) => i + 1), Math.max(1, intervalSeconds) * 1000)
    return () => window.clearInterval(timer)
  }, [count, intervalSeconds])

  if (count === 0) {
    return emptyLabel ? (
      <div className="text-muted flex h-full w-full items-center justify-center p-2 text-center text-sm">
        {emptyLabel}
      </div>
    ) : null
  }

  const current = index % count

  return (
    <div className="relative h-full w-full">
      {imageIds.map((id, i) => (
        <img
          key={id}
          src={imageUrl(id) ?? undefined}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, objectPosition }}
          draggable={false}
        />
      ))}
    </div>
  )
}

export default GallerySlideshow
