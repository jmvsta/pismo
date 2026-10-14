import { useEffect, useRef, useState } from 'react'
import type { AboutPageLanguage } from '../../services/about/index.ts'
import { ABOUT_ICON_NAMES, renderAboutIcon } from './aboutIcons.ts'
import { aboutEditText } from './aboutEditText.ts'

interface AboutIconPickerProps {
  value: string | null
  language: AboutPageLanguage
  onSelect: (name: string | null) => void
}

function AboutIconPicker({ value, language, onSelect }: AboutIconPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeIfOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeIfOutside)
    return () => document.removeEventListener('pointerdown', closeIfOutside)
  }, [open])

  const pick = (name: string | null) => {
    setOpen(false)
    onSelect(name)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-1 border border-[var(--color-divider)] px-2 py-1 text-[11px]"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {renderAboutIcon(value, { size: 14, stroke: 1.75, 'aria-hidden': true })}
        {aboutEditText('icon', language)}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-10 mt-1 grid w-60 grid-cols-6 gap-1 border border-[var(--color-divider)] bg-[var(--color-bg)] p-2 shadow-md">
          <button
            type="button"
            className="col-span-6 border border-[var(--color-divider)] px-2 py-1 text-[11px]"
            onClick={() => pick(null)}
          >
            {aboutEditText('noIcon', language)}
          </button>
          {ABOUT_ICON_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              className={`flex items-center justify-center border p-1 ${
                name === value ? 'border-[var(--color-accent)]' : 'border-transparent'
              } hover:border-[var(--color-divider)]`}
              onClick={() => pick(name)}
            >
              {renderAboutIcon(name, { size: 18, stroke: 1.75, 'aria-hidden': true })}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AboutIconPicker
