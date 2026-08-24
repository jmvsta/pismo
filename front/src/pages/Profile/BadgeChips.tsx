import type { UserBadge } from '../../services/badges/index.ts'

interface BadgeChipsProps {
  badges: UserBadge[]
}

function BadgeChips({ badges }: BadgeChipsProps) {
  if (badges.length === 0) return null

  return (
    <div className="profile-badges">
      {badges.map((userBadge) => (
        <span className="tag tag-accent" key={userBadge.badge.id} title={userBadge.badge.description ?? undefined}>
          {userBadge.badge.title}
        </span>
      ))}
    </div>
  )
}

export default BadgeChips
