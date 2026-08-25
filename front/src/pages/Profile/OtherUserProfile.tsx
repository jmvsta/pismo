import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../../services/user/index.ts'
import type { User } from '../../services/user/index.ts'
import ProfileHeader from './ProfileHeader.tsx'
import './Profile.css'

interface OtherUserProfileProps {
  userId: string
}

type LoadStatus = 'loading' | 'ready' | 'error'

function OtherUserProfile({ userId }: OtherUserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          ← Back to feed
        </Link>

        <ProfileHeader user={user} badges={[]} />

        <p className="text-muted profile-empty">
          Letters, badges, and other activity aren't available for other users yet.
        </p>
      </div>
    </div>
  )
}

export default OtherUserProfile
