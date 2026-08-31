import { Link } from 'react-router-dom'
import type { MatchProfile } from '../../services/matching/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import EnvelopeIcon from '../../components/icons/EnvelopeIcon.tsx'

export type MatchCardVariant = 'new' | 'pending' | 'hidden' | 'matched'

interface MatchCardProps {
  profile: MatchProfile
  sharedInterests: string[]
  score: number | null
  variant: MatchCardVariant
  hasIncomingRequest?: boolean
  requestState?: 'idle' | 'sending' | 'sent' | 'error'
  pendingActionDisabled?: boolean
  onReachOut?: () => void
  onHide?: () => void
  onAccept?: () => void
  onDecline?: () => void
  onEndConnection?: () => void
  onViewQuestionnaire?: () => void
}

function countryFlag(countryCode: string | null): string | null {
  if (!countryCode || countryCode.length !== 2) return null
  const codePoints = [...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function MatchCard({
  profile,
  sharedInterests,
  score,
  variant,
  hasIncomingRequest,
  requestState = 'idle',
  pendingActionDisabled = false,
  onReachOut,
  onHide,
  onAccept,
  onDecline,
  onEndConnection,
  onViewQuestionnaire,
}: MatchCardProps) {
  const flag = countryFlag(profile.countryCode)
  const avatarUrl = imageUrl(profile.avatarImageId)

  return (
    <div className="card match-card">
      <div className={`match-card-photo${avatarUrl ? '' : ' photo-placeholder'}`}>
        {avatarUrl ? <img src={avatarUrl} alt={profile.nickname} /> : <span>avatar</span>}
        {hasIncomingRequest && (
          <span className="match-card-envelope" title="Already reached out to you" aria-hidden="true">
            <EnvelopeIcon />
          </span>
        )}
      </div>

      <div className="match-card-body">
        <div className="match-card-heading">
          {variant === 'matched' ? (
            <Link to={`/profile/${profile.id}`} className="match-card-name">
              {profile.nickname}
            </Link>
          ) : (
            <span className="match-card-name">{profile.nickname}</span>
          )}
          {score !== null && <span className="tag tag-outline match-card-score">{Math.round(score)}%</span>}
        </div>

        {(flag || profile.countryCode) && (
          <span className="text-muted match-card-country">
            {flag} {profile.countryCode}
          </span>
        )}

        {profile.bio && <p className="text-muted match-card-bio">{profile.bio}</p>}

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

        {onViewQuestionnaire && (
          <button type="button" className="btn btn-ghost match-card-questionnaire-link" onClick={onViewQuestionnaire}>
            View questionnaire
          </button>
        )}
      </div>

      <div className="match-card-actions">
        {variant === 'new' && (
          <>
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
          </>
        )}

        {variant === 'hidden' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onReachOut}
            disabled={requestState === 'sending' || requestState === 'sent'}
          >
            {requestState === 'sending' ? 'Sending…' : requestState === 'sent' ? 'Sent ✓' : 'Reach out'}
          </button>
        )}

        {variant === 'pending' && (
          <>
            <button type="button" className="btn btn-primary" onClick={onAccept} disabled={pendingActionDisabled}>
              Accept
            </button>
            <button type="button" className="btn btn-secondary" onClick={onDecline} disabled={pendingActionDisabled}>
              Decline
            </button>
          </>
        )}

        {variant === 'matched' && (
          <button type="button" className="btn btn-secondary" onClick={onEndConnection}>
            End connection
          </button>
        )}
      </div>
      {requestState === 'error' && <p className="text-muted match-card-error">Could not send the request.</p>}
    </div>
  )
}

export default MatchCard
