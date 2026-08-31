import { useState, type ChangeEvent } from 'react'
import type { User } from '../../services/user/index.ts'
import type { UserBadge } from '../../services/badges/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import BadgeChips from './BadgeChips.tsx'
import ProfileBioEditor from './ProfileBioEditor.tsx'

interface ProfileHeaderProps {
  user: User
  badges: UserBadge[]
  onAvatarChange?: (mimeType: string, imageBase64: string) => Promise<void>
  onBioChange?: (bio: string) => Promise<void>
}

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatLocation(user: User): string {
  return [user.city, user.countryCode].filter(Boolean).join(', ')
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function ProfileHeader({ user, badges, onAvatarChange, onBioChange }: ProfileHeaderProps) {
  const location = formatLocation(user)
  const avatarUrl = imageUrl(user.avatarImageId)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onAvatarChange) return
    setUploading(true)
    setError(null)
    try {
      const imageBase64 = await readAsBase64(file)
      await onAvatarChange(file.type, imageBase64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your avatar.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="profile-header">
      <div
        className={`profile-avatar${avatarUrl ? '' : ' photo-placeholder'}${onAvatarChange ? ' profile-avatar-editable' : ''}`}
      >
        {avatarUrl ? <img src={avatarUrl} alt={user.nickname} /> : <span>avatar</span>}
        {onAvatarChange && (
          <label className="profile-avatar-edit">
            <span>{uploading ? 'Uploading…' : 'Change photo'}</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              disabled={uploading}
              onChange={handleFileSelected}
            />
          </label>
        )}
      </div>
      <div className="profile-identity">
        <div className="profile-name-row">
          <h2>{user.nickname}</h2>
          <span className="text-muted">
            {location && `${location} · `}
            member since {formatMemberSince(user.createdAt)}
          </span>
        </div>
        {onBioChange ? (
          <ProfileBioEditor initialBio={user.bio} onSave={onBioChange} />
        ) : (
          <p className="profile-bio">{user.bio || 'No bio yet.'}</p>
        )}
        {error && <p className="text-muted profile-avatar-error">{error}</p>}
        <BadgeChips badges={badges.slice(0, 3)} />
      </div>
    </div>
  )
}

export default ProfileHeader
