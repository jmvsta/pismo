import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { badgesService } from '../../services/badges/index.ts'
import type { UserBadge } from '../../services/badges/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import { matchingService } from '../../services/matching/index.ts'
import ProfileHeader from './ProfileHeader.tsx'
import ProfileLettersTable from './ProfileLettersTable.tsx'
import { toLetterRows, type LetterRow } from './letterRows.ts'
import BadgeChips from './BadgeChips.tsx'
import './Profile.css'

type TabId = 'letters' | 'forum' | 'questionnaire' | 'badges'

const TABS: { id: TabId; label: string }[] = [
  { id: 'letters', label: 'Letters' },
  { id: 'forum', label: 'Forum posts' },
  { id: 'questionnaire', label: 'Questionnaire' },
  { id: 'badges', label: 'Badges' },
]

function MyProfile() {
  const { currentUser, status: userStatus, error: userError, loadCurrentUser } = useUserStore()
  const [activeTab, setActiveTab] = useState<TabId>('letters')
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [letterRows, setLetterRows] = useState<LetterRow[]>([])
  const [activePenPalCount, setActivePenPalCount] = useState(0)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  useEffect(() => {
    let cancelled = false

    async function loadActivity() {
      try {
        const [sent, received, connections, myBadges] = await Promise.all([
          lettersService.sentLetters(),
          lettersService.receivedLetters(),
          matchingService.myConnections(),
          badgesService.myBadges(),
        ])
        if (cancelled) return
        setLetterRows(toLetterRows(sent, received))
        setActivePenPalCount(connections.filter((connection) => !connection.endedAt).length)
        setBadges(myBadges)
      } catch (err) {
        if (!cancelled) {
          setActivityError(err instanceof Error ? err.message : 'Could not load your activity.')
        }
      }
    }

    loadActivity()
    return () => {
      cancelled = true
    }
  }, [])

  if (userStatus === 'idle' || userStatus === 'loading') {
    return (
      <div className="profile-page">
        <p className="text-muted">Loading profile…</p>
      </div>
    )
  }

  if (userStatus === 'error' || !currentUser) {
    return (
      <div className="profile-page">
        <p className="text-muted">{userError ?? 'Could not load your profile.'}</p>
      </div>
    )
  }

  const lettersSentCount = letterRows.filter((row) => row.direction === 'outgoing').length
  const lettersReceivedCount = letterRows.filter((row) => row.direction === 'incoming').length

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          ← Back to feed
        </Link>

        <ProfileHeader user={currentUser} badges={badges} />

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{lettersSentCount}</div>
            <div className="text-muted">letters sent</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{lettersReceivedCount}</div>
            <div className="text-muted">letters received</div>
          </div>
          <div className="profile-stat profile-stat-last">
            <div className="profile-stat-value">{activePenPalCount}</div>
            <div className="text-muted">active pen pals</div>
          </div>
        </div>

        <div className="profile-tabs-panel">
          <div className="profile-tabs">
            {TABS.map((tab) => (
              <span
                key={tab.id}
                className={activeTab === tab.id ? 'is-active' : undefined}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </span>
            ))}
          </div>

          {activityError && <p className="text-muted profile-empty">{activityError}</p>}

          {activeTab === 'letters' && <ProfileLettersTable rows={letterRows} />}
          {activeTab === 'forum' && (
            <p className="text-muted profile-empty">Forum activity isn't available here yet.</p>
          )}
          {activeTab === 'questionnaire' && (
            <p className="text-muted profile-empty">Questionnaire answers are private.</p>
          )}
          {activeTab === 'badges' &&
            (badges.length === 0 ? (
              <p className="text-muted profile-empty">No badges earned yet.</p>
            ) : (
              <BadgeChips badges={badges} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default MyProfile
