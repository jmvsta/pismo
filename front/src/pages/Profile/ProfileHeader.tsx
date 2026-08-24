import type { User } from '../../services/user/index.ts'
import type { UserBadge } from '../../services/badges/index.ts'
import BadgeChips from './BadgeChips.tsx'

interface ProfileHeaderProps {
  user: User
  badges: UserBadge[]
}

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatLocation(user: User): string {
  return [user.city, user.countryCode].filter(Boolean).join(', ')
}

function ProfileHeader({ user, badges }: ProfileHeaderProps) {
  const location = formatLocation(user)

  return (
    <div className="profile-header">
      <div className="photo-placeholder profile-avatar">
        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.nickname} /> : <span>avatar</span>}
      </div>
      <div className="profile-identity">
        <div className="profile-name-row">
          <h2>{user.nickname}</h2>
          <span className="text-muted">
            {location && `${location} · `}
            member since {formatMemberSince(user.createdAt)}
          </span>
        </div>
        <p className="profile-bio">{user.bio || 'No bio yet.'}</p>
        <BadgeChips badges={badges.slice(0, 3)} />
      </div>
    </div>
  )
}

export default ProfileHeader
