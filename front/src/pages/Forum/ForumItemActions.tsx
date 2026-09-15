interface ForumItemActionsProps {
  onEdit: () => void
  onDelete: () => void
}

function ForumItemActions({ onEdit, onDelete }: ForumItemActionsProps) {
  return (
    <span className="forum-item-actions">
      <button type="button" className="forum-reply-link" onClick={onEdit} aria-label="Edit">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>
      <button type="button" className="forum-reply-link" onClick={onDelete} aria-label="Delete">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m7 21-4.3-4.3a2 2 0 0 1 0-2.8l9.6-9.6a2 2 0 0 1 2.8 0l5.6 5.6a2 2 0 0 1 0 2.8L13 21Z" />
          <path d="M22 21H7" />
        </svg>
      </button>
    </span>
  )
}

export default ForumItemActions
