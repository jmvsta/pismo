import type { UserLetterRankBadge } from '../../services/badges/index.ts'

interface LetterRankBadgeChipsProps {
  badges: UserLetterRankBadge[]
}

function LetterRankBadgeChips({ badges }: LetterRankBadgeChipsProps) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((userBadge) => (
        <span
          key={userBadge.badge.id}
          className="tag tag-accent"
          title={`Reached at ${userBadge.badge.minLetters}+ letters sent`}
        >
          {userBadge.badge.title}
        </span>
      ))}
    </div>
  )
}

export default LetterRankBadgeChips
