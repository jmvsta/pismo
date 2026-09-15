interface RichTextLinkPromptProps {
  url: string
  onUrlChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

/** A small URL input, used to set a button block's link on the About page. */
function RichTextLinkPrompt({ url, onUrlChange, onConfirm, onCancel }: RichTextLinkPromptProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-[var(--color-divider)] bg-[var(--color-surface)] p-2">
      <input
        autoFocus
        className="input"
        placeholder="https://… or mailto:…"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onConfirm()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            onCancel()
          }
        }}
      />
      <button type="button" className="btn btn-secondary" onClick={onConfirm}>
        Add link
      </button>
      <button type="button" className="btn btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

export default RichTextLinkPrompt
