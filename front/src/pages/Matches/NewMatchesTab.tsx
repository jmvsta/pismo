import { useCallback, useEffect, useRef, useState } from 'react'
import { matchingService } from '../../services/matching/index.ts'
import type { SuggestedProfile } from '../../services/matching/index.ts'
import MatchCard from './MatchCard.tsx'

const PAGE_SIZE = 12

type RequestState = 'idle' | 'sending' | 'sent' | 'error'

interface NewMatchesTabProps {
  onViewQuestionnaire: (userId: string, nickname: string) => void
}

function NewMatchesTab({ onViewQuestionnaire }: NewMatchesTabProps) {
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestStates, setRequestStates] = useState<Record<string, RequestState>>({})
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    matchingService
      .suggestedProfiles(undefined, PAGE_SIZE, 0)
      .then((result) => {
        if (cancelled) return
        setProfiles(result)
        setOffset(result.length)
        setHasMore(result.length === PAGE_SIZE)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load matches.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const result = await matchingService.suggestedProfiles(undefined, PAGE_SIZE, offset)
      setProfiles((prev) => [...prev, ...result])
      setOffset((prev) => prev + result.length)
      setHasMore(result.length === PAGE_SIZE)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more matches.')
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, hasMore, offset])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore()
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore])

  const handleHide = async (profileId: string) => {
    try {
      await matchingService.hideProfile(profileId)
      setProfiles((prev) => prev.filter((suggestion) => suggestion.user.id !== profileId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not hide this profile.')
    }
  }

  const handleReachOut = async (profileId: string) => {
    setRequestStates((prev) => ({ ...prev, [profileId]: 'sending' }))
    try {
      await matchingService.sendPenPalRequest(profileId)
      setRequestStates((prev) => ({ ...prev, [profileId]: 'sent' }))
    } catch {
      setRequestStates((prev) => ({ ...prev, [profileId]: 'error' }))
    }
  }

  return (
    <>
      {error && <p className="text-muted matches-empty">{error}</p>}
      {!error && loading && <p className="text-muted matches-empty">Loading matches…</p>}
      {!error && !loading && profiles.length === 0 && (
        <p className="text-muted matches-empty">No matches yet — check back after filling out your profile.</p>
      )}

      <div className="matches-grid">
        {profiles.map((suggestion) => (
          <MatchCard
            key={suggestion.user.id}
            variant="new"
            profile={suggestion.user}
            sharedInterests={suggestion.sharedInterests}
            score={suggestion.score}
            hasIncomingRequest={suggestion.hasIncomingRequest}
            requestState={requestStates[suggestion.user.id] ?? 'idle'}
            onReachOut={() => handleReachOut(suggestion.user.id)}
            onHide={() => handleHide(suggestion.user.id)}
            onViewQuestionnaire={() => onViewQuestionnaire(suggestion.user.id, suggestion.user.nickname)}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="matches-sentinel">
        {loadingMore && <span className="text-muted">Loading more…</span>}
        {!hasMore && !loading && profiles.length > 0 && (
          <span className="text-muted">You've reached the end of your matches.</span>
        )}
      </div>
    </>
  )
}

export default NewMatchesTab
