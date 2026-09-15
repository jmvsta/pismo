import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../../services/user/index.ts'
import type { User } from '../../services/user/index.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { PenPalConnection, PenPalRequest } from '../../services/matching/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import ProfileHeader from './ProfileHeader.tsx'
import PenPalLetterAction from '../../components/PenPalLetterAction/PenPalLetterAction.tsx'
import './Profile.css'

interface OtherUserProfileProps {
  userId: string
}

type LoadStatus = 'loading' | 'ready' | 'error'
type RequestState = 'idle' | 'sending' | 'sent' | 'error'

function OtherUserProfile({ userId }: OtherUserProfileProps) {
  const currentUserId = useUserStore((state) => state.currentUser?.id)
  const language = useLanguageStore((state) => state.language)
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const [connection, setConnection] = useState<PenPalConnection | null>(null)
  const [outgoingPending, setOutgoingPending] = useState<PenPalRequest | null>(null)
  const [incomingPending, setIncomingPending] = useState<PenPalRequest | null>(null)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [pendingActionDisabled, setPendingActionDisabled] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    userService
      .getUser(userId)
      .then((fetched) => {
        if (cancelled) return
        if (!fetched) {
          setStatus('error')
          setError('This user could not be found.')
          return
        }
        setUser(fetched)
        setStatus('ready')
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Could not load this profile.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!currentUserId || currentUserId === userId) return
    let cancelled = false

    Promise.all([matchingService.myConnections(), matchingService.penPalRequests('PENDING')])
      .then(([connections, requests]) => {
        if (cancelled) return
        setConnection(
          connections.find((c) => !c.endedAt && (c.userA.id === userId || c.userB.id === userId)) ?? null,
        )
        setOutgoingPending(
          requests.find((r) => r.requester.id === currentUserId && r.addressee.id === userId) ?? null,
        )
        setIncomingPending(
          requests.find((r) => r.requester.id === userId && r.addressee.id === currentUserId) ?? null,
        )
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [currentUserId, userId])

  const handleReachOut = async () => {
    setRequestState('sending')
    setActionError(null)
    try {
      const request = await matchingService.sendPenPalRequest(userId)
      setOutgoingPending(request)
      setRequestState('sent')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not send this request.')
      setRequestState('error')
    }
  }

  const handleAccept = async () => {
    if (!incomingPending) return
    setPendingActionDisabled(true)
    setActionError(null)
    try {
      await matchingService.respondToPenPalRequest(incomingPending.id, true)
      const connections = await matchingService.myConnections()
      setConnection(
        connections.find((c) => !c.endedAt && (c.userA.id === userId || c.userB.id === userId)) ?? null,
      )
      setIncomingPending(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not accept this request.')
    } finally {
      setPendingActionDisabled(false)
    }
  }

  const handleDecline = async () => {
    if (!incomingPending) return
    setPendingActionDisabled(true)
    setActionError(null)
    try {
      await matchingService.respondToPenPalRequest(incomingPending.id, false)
      setIncomingPending(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not decline this request.')
    } finally {
      setPendingActionDisabled(false)
    }
  }

  const handleEndConnection = async () => {
    if (!connection) return
    setActionError(null)
    try {
      await matchingService.endConnection(connection.id)
      setConnection(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not end this connection.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="profile-page">
        <p className="text-muted">Loading profile…</p>
      </div>
    )
  }

  if (status === 'error' || !user) {
    return (
      <div className="profile-page">
        <p className="text-muted">{error ?? 'Could not load this profile.'}</p>
      </div>
    )
  }

  if (user.status === 'DELETED') {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <Link to="/" className="profile-back">
            {uiText('backToFeed', language)}
          </Link>
          <p className="text-muted profile-empty">This account has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          {uiText('backToFeed', language)}
        </Link>

        <ProfileHeader user={user} badges={[]} />

        {currentUserId && currentUserId !== userId && (
          <div className="profile-actions">
            {connection ? (
              <>
                <PenPalLetterAction
                  connection={connection}
                  currentUserId={currentUserId}
                  otherId={userId}
                  otherNickname={user.nickname}
                />
                <button type="button" className="btn btn-secondary" onClick={handleEndConnection}>
                  End connection
                </button>
              </>
            ) : incomingPending ? (
              <>
                <button type="button" className="btn btn-primary" onClick={handleAccept} disabled={pendingActionDisabled}>
                  Accept
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDecline}
                  disabled={pendingActionDisabled}
                >
                  Decline
                </button>
              </>
            ) : outgoingPending ? (
              <span className="text-muted match-card-waiting">Waiting for a response…</span>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleReachOut}
                disabled={requestState === 'sending' || requestState === 'sent'}
              >
                {requestState === 'sending' ? 'Sending…' : requestState === 'sent' ? 'Sent ✓' : 'Reach out'}
              </button>
            )}
          </div>
        )}
        {actionError && <p className="text-muted match-card-error profile-action-error">{actionError}</p>}
      </div>
    </div>
  )
}

export default OtherUserProfile
