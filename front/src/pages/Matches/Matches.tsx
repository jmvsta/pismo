import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { SuggestedProfile } from '../../services/matching/index.ts'
import MatchCard from './MatchCard.tsx'
import './Matches.css'

const PAGE_SIZE = 12

type RequestState = 'idle' | 'sending' | 'sent' | 'error'

function Matches() {
  const currentUser = useUserStore((state) => state.currentUser)
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestStates, setRequestStates] = useState<Record<string, RequestState>>({})
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!currentUser) return
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
  }, [currentUser])

  const handleLoadMore = useCallback(async () => {
    if (!currentUser || loading || loadingMore || !hasMore) return
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
  }, [currentUser, loading, loadingMore, hasMore, offset])

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

  if (!currentUser) {
    return (
      <div className="matches-page">
        <p className="text-muted">Sign in to see your suggested pen pals.</p>
      </div>
    )
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <Link to="/" className="matches-back">
          ← Back to feed
        </Link>
        <h2>Find a pen pal</h2>
        <p className="text-muted">
          Browse profiles matched by shared interests. Reach out to start a letter, or hide a profile you're not
          interested in — this isn't a dating app, just pen pals.
        </p>
      </div>

      {error && <p className="text-muted matches-empty">{error}</p>}

      {!error && loading && <p className="text-muted matches-empty">Loading matches…</p>}

      {!error && !loading && profiles.length === 0 && (
        <p className="text-muted matches-empty">No matches yet — check back after filling out your profile.</p>
      )}

      <div className="matches-grid">
        {profiles.map((suggestion) => (
          <MatchCard
            key={suggestion.user.id}
            profile={suggestion.user}
            sharedInterests={suggestion.sharedInterests}
            score={suggestion.score}
            requestState={requestStates[suggestion.user.id] ?? 'idle'}
            onReachOut={() => handleReachOut(suggestion.user.id)}
            onHide={() => handleHide(suggestion.user.id)}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="matches-sentinel">
        {loadingMore && <span className="text-muted">Loading more…</span>}
        {!hasMore && !loading && profiles.length > 0 && (
          <span className="text-muted">You've reached the end of your matches.</span>
        )}
      </div>
    </div>
  )
}

export default Matches
