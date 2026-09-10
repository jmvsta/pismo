import { useState } from 'react'

const BASIC_SMILES = ['😀', '😂', '😉', '😍', '😢', '😮', '😅', '😎', '🙁', '👍', '❤️', '🎉']

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Insert a smiley"
      >
        🙂
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 grid grid-cols-6 gap-1 border border-[var(--color-divider)] bg-[var(--color-surface)] p-2">
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
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
