import { useCallback, useRef, useState, type KeyboardEvent, type RefObject } from 'react'

interface Selection {
  start: number
  end: number
}

export interface RichTextFormatting {
  /** Attach to the textarea's onKeyDown. Handles ctrl/cmd+b/i/u/s and ctrl/cmd+a. */
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  linkPromptOpen: boolean
  linkUrl: string
  setLinkUrl: (value: string) => void
  confirmLink: () => void
  cancelLink: () => void
}

/**
 * Keyboard shortcuts for the hand-rolled markdown subset in lib/richText.tsx: ctrl/cmd+b
 * wraps the selection in **bold**, +i in *italic*, +u in <u>underline</u>, +s in
 * <s>strikethrough</s>, and +a opens a small URL prompt (see linkPromptOpen) that wraps
 * the selection in <a href='...'>...</a> once confirmed.
 */
export function useRichTextFormatting(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (value: string) => void,
): RichTextFormatting {
  const [linkPromptOpen, setLinkPromptOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const pendingSelection = useRef<Selection>({ start: 0, end: 0 })

  const applyWrap = useCallback(
    (before: string, after: string = before) => {
      const el = textareaRef.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = value.slice(start, end)
      const next = value.slice(0, start) + before + selected + after + value.slice(end)
      onChange(next)
      const selectionStart = start + before.length
      const selectionEnd = selectionStart + selected.length
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(selectionStart, selectionEnd)
      })
    },
    [value, onChange, textareaRef],
  )

  const openLinkPrompt = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    pendingSelection.current = { start: el.selectionStart, end: el.selectionEnd }
    setLinkUrl('')
    setLinkPromptOpen(true)
  }, [textareaRef])

  const confirmLink = useCallback(() => {
    const el = textareaRef.current
    const url = linkUrl.trim()
    setLinkPromptOpen(false)
    if (!el || url === '') return
    const { start, end } = pendingSelection.current
    const selected = value.slice(start, end) || url
    const next = `${value.slice(0, start)}<a href='${url}'>${selected}</a>${value.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => el.focus())
  }, [linkUrl, value, onChange, textareaRef])

  const cancelLink = useCallback(() => {
    setLinkPromptOpen(false)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [textareaRef])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          applyWrap('**')
          break
        case 'i':
          e.preventDefault()
          applyWrap('*')
          break
        case 'u':
          e.preventDefault()
          applyWrap('<u>', '</u>')
          break
        case 's':
          e.preventDefault()
          applyWrap('<s>', '</s>')
          break
        case 'a':
          e.preventDefault()
          openLinkPrompt()
          break
      }
    },
    [applyWrap, openLinkPrompt],
  )

  return { handleKeyDown, linkPromptOpen, linkUrl, setLinkUrl, confirmLink, cancelLink }
}
