import { useEffect, useRef, useState } from 'react'
import { useLanguageStore } from '../../store/languageStore.ts'
import type { Language } from '../../store/languageStore.ts'
import './LanguageSwitcher.css'

const LANGUAGES: Language[] = ['EN', 'RU', 'SRB']

function LanguageSwitcher({ className }: { className?: string }) {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={`lang-switcher${className ? ` ${className}` : ''}`} ref={ref}>
      <button
        type="button"
        className="lang-switcher-btn is-active lang-switcher-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {language}
        <span className="lang-switcher-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="lang-switcher-menu" role="listbox">
          {LANGUAGES.filter((lang) => lang !== language).map((lang) => (
            <button
              key={lang}
              type="button"
              role="option"
              aria-selected="false"
              className="lang-switcher-btn"
              onClick={() => {
                setLanguage(lang)
                setOpen(false)
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
