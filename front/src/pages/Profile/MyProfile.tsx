import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { badgesService } from '../../services/badges/index.ts'
import type { UserBadge } from '../../services/badges/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import { matchingService } from '../../services/matching/index.ts'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost } from '../../services/forum/index.ts'
import { questionnaireService } from '../../services/questionnaire/index.ts'
import type { QuestionnaireAnswers, QuestionnaireDefinition } from '../../store/questionnaireDefinition.ts'
import ProfileHeader from './ProfileHeader.tsx'
import ProfileLettersTable from './ProfileLettersTable.tsx'
import ProfileForumActivity from './ProfileForumActivity.tsx'
import ProfileQuestionnaireAnswers from './ProfileQuestionnaireAnswers.tsx'
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
  const { currentUser, status: userStatus, error: userError, loadCurrentUser, updateAvatar } = useUserStore()
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = TABS.some((tab) => tab.id === requestedTab) ? (requestedTab as TabId) : 'letters'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [letterRows, setLetterRows] = useState<LetterRow[]>([])
  const [activePenPalCount, setActivePenPalCount] = useState(0)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [allForumPosts, setAllForumPosts] = useState<ForumPost[]>([])
  const [questionnaireDefinition, setQuestionnaireDefinition] = useState<QuestionnaireDefinition | null>(null)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>({})
  const [hasSubmittedQuestionnaire, setHasSubmittedQuestionnaire] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  useEffect(() => {
    let cancelled = false

    async function loadActivity() {
      try {
        const [sent, received, connections, myBadges, posts, activeVersion] = await Promise.all([
          lettersService.sentLetters(),
          lettersService.receivedLetters(),
          matchingService.myConnections(),
          badgesService.myBadges(),
          forumService.forumPosts(),
          questionnaireService.activeQuestionnaire('REGISTRATION'),
        ])
        if (cancelled) return
        setLetterRows(toLetterRows(sent, received))
        setActivePenPalCount(connections.filter((connection) => !connection.endedAt).length)
        setBadges(myBadges)
        setAllForumPosts(posts)

        if (activeVersion) {
          setQuestionnaireDefinition(JSON.parse(activeVersion.definition) as QuestionnaireDefinition)
          const response = await questionnaireService.myQuestionnaireResponse(activeVersion.id)
          if (cancelled) return
          if (response?.submittedAt) {
            setQuestionnaireAnswers(JSON.parse(response.answers) as QuestionnaireAnswers)
            setHasSubmittedQuestionnaire(true)
          }
        }
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
  const myForumPosts = allForumPosts.filter((post) => post.author.id === currentUser.id)

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          ← Back to feed
        </Link>

        <ProfileHeader user={currentUser} badges={badges} onAvatarChange={updateAvatar} />

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
          {activeTab === 'forum' && <ProfileForumActivity posts={myForumPosts} />}
          {activeTab === 'questionnaire' && (
            <ProfileQuestionnaireAnswers
              definition={questionnaireDefinition}
              answers={questionnaireAnswers}
              hasSubmitted={hasSubmittedQuestionnaire}
            />
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
