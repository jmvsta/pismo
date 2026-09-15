import { useState } from 'react'

interface ProfileNicknameEditorProps {
  initialNickname: string
  onSave: (nickname: string) => Promise<void>
}

function ProfileNicknameEditor({ initialNickname, onSave }: ProfileNicknameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(initialNickname)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEditing = () => {
    setNickname(initialNickname)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setNickname(initialNickname)
    setError(null)
    setEditing(false)
  }

  const handleSave = async () => {
    const trimmed = nickname.trim()
    if (!trimmed || trimmed === initialNickname) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this nickname.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <span className="profile-nickname-display">
        <h2>{initialNickname}</h2>
        <button
          type="button"
          className="profile-nickname-edit-btn"
          onClick={startEditing}
          aria-label="Edit nickname"
        >
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
      </span>
    )
  }

  return (
    <span className="profile-nickname-editor">
      <input
        className="input"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        autoFocus
        disabled={saving}
      />
      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button type="button" className="btn btn-ghost" onClick={cancel} disabled={saving}>
        Cancel
      </button>
      {error && <span className="profile-nickname-error text-muted">{error}</span>}
    </span>
  )
}

export default ProfileNicknameEditor
