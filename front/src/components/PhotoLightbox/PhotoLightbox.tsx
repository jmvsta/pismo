import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface PhotoLightboxProps {
  src: string
  alt: string
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 6
const ZOOM_SENSITIVITY = 0.0018

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const wasDragged = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const resetView = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      setScale((current) => {
        const next = clamp(current - e.deltaY * ZOOM_SENSITIVITY * current, MIN_SCALE, MAX_SCALE)
        if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
        return next
      })
    }
    container?.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.body.style.overflow = previousOverflow
      container?.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (scale <= MIN_SCALE) return
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    wasDragged.current = false
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) wasDragged.current = true
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    dragState.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()
    if (wasDragged.current) {
      wasDragged.current = false
      return
    }
    if (scale > MIN_SCALE) resetView()
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/80 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        className="btn btn-icon absolute right-4 top-4 text-white"
        onClick={onClose}
        aria-label="Close preview"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain select-none"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: scale > MIN_SCALE ? 'grab' : 'zoom-in',
          touchAction: 'none',
        }}
        draggable={false}
        onClick={handleImageClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>,
    document.body,
  )
}

export default PhotoLightbox
