import { useRef, useState } from 'react'
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave.ts'
import EmojiPicker from '../../components/EmojiPicker/EmojiPicker.tsx'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const status = useDebouncedAutosave(bio, onSave)
  const label = statusLabel(status)

  const handleEmojiInsert = (emoji: string) => {
    const cursor = textareaRef.current?.selectionStart ?? bio.length
    setBio(bio.slice(0, cursor) + emoji + bio.slice(cursor))
  }

  return (
    <div className="flex flex-col gap-1">
      <textarea
        ref={textareaRef}
        className="profile-bio w-full resize-y border border-[var(--color-divider)] bg-[var(--color-surface)] p-2 text-[15px] leading-normal text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        rows={3}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell your future pen pal about yourself…"
        title="Supports **bold**, *italic*, <u>underline</u>, <s>strikethrough</s>, and <a href='https://...'>links</a>."
      />
      <div className="flex items-center gap-2">
        <EmojiPicker onSelect={handleEmojiInsert} />
        {label && (
          <span className={`text-xs ${status === 'error' ? 'text-[var(--color-accent)]' : 'text-muted'}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

export default ProfileBioEditor
