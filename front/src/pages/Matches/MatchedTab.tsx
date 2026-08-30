import { useEffect, useState } from 'react'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalConnection } from '../../services/matching/index.ts'
import MatchCard from './MatchCard.tsx'

function MatchedTab() {
  const currentUserId = useUserStore((state) => state.currentUser?.id)
  const [connections, setConnections] = useState<PenPalConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    matchingService
      .myConnections()
      .then((result) => {
        if (!cancelled) setConnections(result.filter((connection) => !connection.endedAt))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your matches.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleEndConnection = async (connectionId: string) => {
    try {
      await matchingService.endConnection(connectionId)
      setConnections((prev) => prev.filter((connection) => connection.id !== connectionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not end this connection.')
    }
  }

  if (error) return <p className="text-muted matches-empty">{error}</p>
  if (loading) return <p className="text-muted matches-empty">Loading your matches…</p>
  if (connections.length === 0) {
    return <p className="text-muted matches-empty">No matches yet — accept a pending request to get started.</p>
  }

  return (
    <div className="matches-grid">
      {connections.map((connection) => {
        const other = connection.userA.id === currentUserId ? connection.userB : connection.userA
        return (
          <MatchCard
            key={connection.id}
            variant="matched"
            profile={other}
            sharedInterests={[]}
            score={null}
            onEndConnection={() => handleEndConnection(connection.id)}
          />
        )
      })}
    </div>
  )
}

export default MatchedTab
