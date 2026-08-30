import { Link } from 'react-router-dom'
import type { MatchProfile } from '../../services/matching/index.ts'

interface MatchCardProps {
  profile: MatchProfile
  sharedInterests: string[]
  score: number | null
  requestState: 'idle' | 'sending' | 'sent' | 'error'
  onReachOut: () => void
  onHide: () => void
}

function countryFlag(countryCode: string | null): string | null {
  if (!countryCode || countryCode.length !== 2) return null
  const codePoints = [...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function MatchCard({ profile, sharedInterests, score, requestState, onReachOut, onHide }: MatchCardProps) {
  const flag = countryFlag(profile.countryCode)

  return (
    <div className="card match-card">
      <div className="match-card-photo photo-placeholder">
        {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.nickname} /> : <span>avatar</span>}
      </div>

      <div className="match-card-body">
        <div className="match-card-heading">
          <Link to={`/profile/${profile.id}`} className="match-card-name">
            {profile.nickname}
          </Link>
          {score !== null && <span className="tag tag-outline match-card-score">{Math.round(score)}%</span>}
        </div>

        {(flag || profile.countryCode) && (
          <span className="text-muted match-card-country">
            {flag} {profile.countryCode}
          </span>
        )}

        <div className="match-card-interests">
          {sharedInterests.length === 0 ? (
            <span className="text-muted">No shared interests on file yet.</span>
          ) : (
            sharedInterests.map((interest) => (
              <span className="tag tag-neutral" key={interest}>
                {interest}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="match-card-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onReachOut}
          disabled={requestState === 'sending' || requestState === 'sent'}
        >
          {requestState === 'sending' ? 'Sending…' : requestState === 'sent' ? 'Sent ✓' : 'Reach out'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Hide
        </button>
      </div>
      {requestState === 'error' && <p className="text-muted match-card-error">Could not send the request.</p>}
    </div>
  )
}

export default MatchCard
