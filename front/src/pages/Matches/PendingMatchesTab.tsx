import { useEffect, useState } from 'react'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalRequest } from '../../services/matching/index.ts'
import MatchCard from './MatchCard.tsx'

interface PendingMatchesTabProps {
  onViewQuestionnaire: (userId: string, nickname: string) => void
}

function PendingMatchesTab({ onViewQuestionnaire }: PendingMatchesTabProps) {
  const currentUserId = useUserStore((state) => state.currentUser?.id)
  const [requests, setRequests] = useState<PenPalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    matchingService
      .penPalRequests('PENDING')
      .then((result) => {
        if (cancelled) return
        setRequests(result.filter((request) => request.addressee.id === currentUserId))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load pending requests.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentUserId])

  const handleRespond = async (requestId: string, accept: boolean) => {
    if (respondingIds.has(requestId)) return
    setRespondingIds((prev) => new Set(prev).add(requestId))
    try {
      await matchingService.respondToPenPalRequest(requestId, accept)
      setRequests((prev) => prev.filter((request) => request.id !== requestId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not respond to this request.')
      setRespondingIds((prev) => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  if (error) return <p className="text-muted matches-empty">{error}</p>
  if (loading) return <p className="text-muted matches-empty">Loading requests…</p>
  if (requests.length === 0) {
    return <p className="text-muted matches-empty">No one has reached out yet.</p>
  }

  return (
    <div className="matches-grid">
      {requests.map((request) => (
        <MatchCard
          key={request.id}
          variant="pending"
          profile={request.requester}
          sharedInterests={[]}
          score={null}
          pendingActionDisabled={respondingIds.has(request.id)}
          onAccept={() => handleRespond(request.id, true)}
          onDecline={() => handleRespond(request.id, false)}
          onViewQuestionnaire={() => onViewQuestionnaire(request.requester.id, request.requester.nickname)}
        />
      ))}
    </div>
  )
}

export default PendingMatchesTab
