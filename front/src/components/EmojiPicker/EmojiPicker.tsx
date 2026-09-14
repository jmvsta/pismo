import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const BASIC_SMILES = ['😀', '😂', '😉', '😍', '😢', '😮', '😅', '😎', '🙁', '👍', '❤️', '🎉']

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({ top: rect.bottom + 4, left: rect.left })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleClickAway = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Insert a smiley"
      >
        🙂
      </button>
      {isOpen &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] grid grid-cols-6 gap-1 border border-[var(--color-divider)] bg-[var(--color-surface)] p-2 shadow-lg"
            style={{ top: position.top, left: position.left }}
          >
            {BASIC_SMILES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-lg leading-none p-1 hover:bg-[var(--color-neutral-200)]"
                onClick={() => {
                  onSelect(emoji)
                  setIsOpen(false)
                }}
              >
                {emoji}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

export default EmojiPicker
