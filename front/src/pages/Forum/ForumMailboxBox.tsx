import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'

export type LetterRequestState = 'idle' | 'sending' | 'sent' | 'error'

interface ForumMailboxBoxProps {
  state: LetterRequestState
  onRequest: () => void
  className?: string
}

function ForumMailboxBox({ state, onRequest, className }: ForumMailboxBoxProps) {
  const language = useLanguageStore((s) => s.language)
  const copyKey =
    state === 'sent' ? 'forumMailboxSent' : state === 'error' ? 'forumMailboxError' : 'forumMailboxCopy'

  return (
    <button
      type="button"
      className={`forum-mailbox-box${className ? ` ${className}` : ''}`}
      onClick={onRequest}
      disabled={state === 'sending' || state === 'sent'}
    >
      <svg
        className="forum-mailbox-icon"
        viewBox="0 0 24 24"
        width="36"
        height="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 11a5 5 0 0 1 10 0v7H4z" />
        <rect x="14" y="9" width="4" height="4" />
        <line x1="9" y1="18" x2="9" y2="22" />
        <line x1="5" y1="22" x2="13" y2="22" />
      </svg>
      <div className="forum-mailbox-title">{uiText('forumMailboxTitle', language)}</div>
      <div className="forum-mailbox-copy">{uiText(copyKey, language)}</div>
    </button>
  )
}

export default ForumMailboxBox
