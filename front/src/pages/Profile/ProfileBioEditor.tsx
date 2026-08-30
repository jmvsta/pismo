import { useState } from 'react'
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave.ts'

interface ProfileBioEditorProps {
  initialBio: string | null
  onSave: (bio: string) => Promise<void>
}

function statusLabel(status: 'idle' | 'saving' | 'saved' | 'error'): string | null {
  switch (status) {
    case 'saving':
      return 'Saving…'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Could not save'
    default:
      return null
  }
}

function ProfileBioEditor({ initialBio, onSave }: ProfileBioEditorProps) {
  const [bio, setBio] = useState(initialBio ?? '')
  const status = useDebouncedAutosave(bio, onSave)
  const label = statusLabel(status)

  return (
    <div className="flex flex-col gap-1">
      <textarea
        className="profile-bio w-full resize-y border border-[var(--color-divider)] bg-[var(--color-surface)] p-2 text-[15px] leading-normal text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        rows={3}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell your future pen pal about yourself…"
      />
      {label && (
        <span className={`text-xs ${status === 'error' ? 'text-[var(--color-accent)]' : 'text-muted'}`}>
          {label}
        </span>
      )}
    </div>
  )
}

export default ProfileBioEditor
