import { useEffect, useState } from 'react'
import { matchingService } from '../../services/matching/index.ts'
import type { SuggestedProfile } from '../../services/matching/index.ts'
import MatchCard from './MatchCard.tsx'

type RequestState = 'idle' | 'sending' | 'sent' | 'error'

interface HiddenMatchesTabProps {
  onViewQuestionnaire: (userId: string, nickname: string) => void
}

function HiddenMatchesTab({ onViewQuestionnaire }: HiddenMatchesTabProps) {
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestStates, setRequestStates] = useState<Record<string, RequestState>>({})

  useEffect(() => {
    let cancelled = false

    matchingService
      .hiddenProfiles()
      .then((result) => {
        if (!cancelled) setProfiles(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load hidden profiles.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleReachOut = async (profileId: string) => {
    setRequestStates((prev) => ({ ...prev, [profileId]: 'sending' }))
    try {
      await matchingService.sendPenPalRequest(profileId)
      setRequestStates((prev) => ({ ...prev, [profileId]: 'sent' }))
    } catch {
      setRequestStates((prev) => ({ ...prev, [profileId]: 'error' }))
    }
  }

  if (error) return <p className="text-muted matches-empty">{error}</p>
  if (loading) return <p className="text-muted matches-empty">Loading hidden profiles…</p>
  if (profiles.length === 0) {
    return <p className="text-muted matches-empty">You haven't hidden anyone.</p>
  }

  return (
    <div className="matches-grid">
      {profiles.map((suggestion) => (
        <MatchCard
          key={suggestion.user.id}
          variant="hidden"
          profile={suggestion.user}
          sharedInterests={suggestion.sharedInterests}
          score={suggestion.score}
          requestState={requestStates[suggestion.user.id] ?? 'idle'}
          onReachOut={() => handleReachOut(suggestion.user.id)}
          onViewQuestionnaire={() => onViewQuestionnaire(suggestion.user.id, suggestion.user.nickname)}
        />
      ))}
    </div>
  )
}

export default HiddenMatchesTab
