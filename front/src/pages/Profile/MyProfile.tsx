import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { useNotificationStore } from '../../store/notificationStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import type { UiTextKey } from '../../i18n/uiText.ts'
import { badgesService } from '../../services/badges/index.ts'
import type { UserBadge, UserLetterRankBadge } from '../../services/badges/index.ts'
import { lettersService } from '../../services/letters/index.ts'
import { matchingService } from '../../services/matching/index.ts'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost } from '../../services/forum/index.ts'
import { questionnaireService } from '../../services/questionnaire/index.ts'
import type { QuestionnaireKind } from '../../services/questionnaire/index.ts'
import type { QuestionnaireAnswers, QuestionnaireDefinition } from '../../store/questionnaireDefinition.ts'
import ProfileHeader from './ProfileHeader.tsx'
import ProfileLettersTable from './ProfileLettersTable.tsx'
import ProfileForumActivity from './ProfileForumActivity.tsx'
import ProfileQuestionnaireAnswers from './ProfileQuestionnaireAnswers.tsx'
import ProfileAddressForm from './ProfileAddressForm.tsx'
import ProfilePenPals from './ProfilePenPals.tsx'
import ProfileVerifyEmailBanner from './ProfileVerifyEmailBanner.tsx'
import { toLetterRows, type LetterRow } from './letterRows.ts'
import BadgeChips from './BadgeChips.tsx'
import LetterRankBadgeChips from './LetterRankBadgeChips.tsx'
import './Profile.css'

type TabId = 'penpals' | 'letters' | 'forum' | 'questionnaire' | 'address' | 'badges'

const TABS: { id: TabId; key: UiTextKey }[] = [
  { id: 'penpals', key: 'profileTabPenPals' },
  { id: 'letters', key: 'profileTabLetters' },
  { id: 'forum', key: 'profileTabPosts' },
  { id: 'questionnaire', key: 'profileTabQuestionnaire' },
  { id: 'address', key: 'profileTabAddress' },
  { id: 'badges', key: 'profileTabBadges' },
]

const QUESTIONNAIRE_KINDS: { kind: QuestionnaireKind; label: string }[] = [
  { kind: 'REGISTRATION', label: 'Registration questionnaire' },
  { kind: 'EXPERIENCE', label: 'Experience questionnaire' },
]

interface QuestionnaireSlot {
  kind: QuestionnaireKind
  label: string
  versionId: string
  definition: QuestionnaireDefinition
  answers: QuestionnaireAnswers
  hasSubmitted: boolean
}

function MyProfile() {
  const { currentUser, status: userStatus, error: userError, loadCurrentUser, updateAvatar, updateProfile } =
    useUserStore()
  const language = useLanguageStore((state) => state.language)
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = TABS.some((tab) => tab.id === requestedTab) ? (requestedTab as TabId) : 'penpals'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [letterRankBadges, setLetterRankBadges] = useState<UserLetterRankBadge[]>([])
  const [letterRows, setLetterRows] = useState<LetterRow[]>([])
  const [activePenPalCount, setActivePenPalCount] = useState(0)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [allForumPosts, setAllForumPosts] = useState<ForumPost[]>([])
  const [questionnaireSlots, setQuestionnaireSlots] = useState<QuestionnaireSlot[]>([])
  const notifications = useNotificationStore((state) => state.notifications)
  const lastNotificationIdRef = useRef<string | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const refreshLetters = () => {
    Promise.all([lettersService.sentLetters(), lettersService.receivedLetters()])
      .then(([sent, received]) => setLetterRows(toLetterRows(sent, received)))
      .catch(() => {})
  }

  useEffect(() => {
    const latest = notifications[0]
    if (!latest) return
    const isFirstRun = lastNotificationIdRef.current === null
    lastNotificationIdRef.current = latest.id
    if (isFirstRun) return
    if (latest.type !== 'LETTER_SENT' && latest.type !== 'LETTER_DELIVERED') return

    refreshLetters()
  }, [notifications])

  useEffect(() => {
    let cancelled = false

    async function loadQuestionnaireSlots(): Promise<QuestionnaireSlot[]> {
      const slots = await Promise.all(
        QUESTIONNAIRE_KINDS.map(async ({ kind, label }) => {
          const activeVersion = await questionnaireService.activeQuestionnaire(kind)
          if (!activeVersion) return null
          const response = await questionnaireService.myQuestionnaireResponse(activeVersion.id)
          const slot: QuestionnaireSlot = {
            kind,
            label,
            versionId: activeVersion.id,
            definition: JSON.parse(activeVersion.definition) as QuestionnaireDefinition,
            answers: response?.submittedAt ? (JSON.parse(response.answers) as QuestionnaireAnswers) : {},
            hasSubmitted: Boolean(response?.submittedAt),
          }
          return slot
        }),
      )
      return slots.filter((slot): slot is QuestionnaireSlot => slot !== null)
    }

    async function loadActivity() {
      try {
        const [sent, received, connections, myBadges, myLetterRankBadges, posts, slots] = await Promise.all([
          lettersService.sentLetters(),
          lettersService.receivedLetters(),
          matchingService.myConnections(),
          badgesService.myBadges(),
          badgesService.myLetterRankBadges(),
          forumService.forumPosts(),
          loadQuestionnaireSlots(),
        ])
        if (cancelled) return
        setLetterRows(toLetterRows(sent, received))
        setActivePenPalCount(connections.filter((connection) => !connection.endedAt).length)
        setBadges(myBadges)
        setLetterRankBadges(myLetterRankBadges)
        setAllForumPosts(posts)
        setQuestionnaireSlots(slots)
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

  const lettersSentCount = letterRows.filter(
    (row) => row.direction === 'outgoing' && row.status !== 'DRAFT',
  ).length
  const lettersReceivedCount = letterRows.filter(
    (row) => row.direction === 'incoming' && row.status === 'DELIVERED',
  ).length
  const myForumPosts = allForumPosts.filter((post) => post.author.id === currentUser.id)

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          {uiText('backToFeed', language)}
        </Link>

        <ProfileHeader
          user={currentUser}
          badges={badges}
          onAvatarChange={updateAvatar}
          onBioChange={(bio) => updateProfile({ bio })}
          onNicknameChange={(nickname) => updateProfile({ nickname })}
        />

        {!currentUser.emailVerifiedAt && <ProfileVerifyEmailBanner />}

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{lettersSentCount}</div>
            <div className="text-muted">{uiText('profileStatSent', language)}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{lettersReceivedCount}</div>
            <div className="text-muted">{uiText('profileStatReceived', language)}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{activePenPalCount}</div>
            <div className="text-muted">{uiText('profileStatPenPals', language)}</div>
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
                {uiText(tab.key, language)}
              </span>
            ))}
          </div>

          {activityError && activeTab !== 'penpals' && <p className="text-muted profile-empty">{activityError}</p>}

          {activeTab === 'penpals' && (
            <ProfilePenPals onGoToAddressTab={() => setActiveTab('address')} onLetterChanged={refreshLetters} />
          )}
          {activeTab === 'letters' && <ProfileLettersTable rows={letterRows} />}
          {activeTab === 'forum' && <ProfileForumActivity posts={myForumPosts} />}
          {activeTab === 'questionnaire' && (
            <div className="flex flex-col gap-6">
              {questionnaireSlots.map((slot) => (
                <ProfileQuestionnaireAnswers
                  key={slot.kind}
                  title={slot.label}
                  definition={slot.definition}
                  answers={slot.answers}
                  hasSubmitted={slot.hasSubmitted}
                  action={
                    <Link
                      to={`/questionnaire?kind=${slot.kind}`}
                      state={{ returnTo: '/profile?tab=questionnaire' }}
                      className="btn btn-ghost"
                    >
                      {slot.hasSubmitted ? 'Edit answers' : 'Fill out'}
                    </Link>
                  }
                />
              ))}
            </div>
          )}
          {activeTab === 'address' && <ProfileAddressForm />}
          {activeTab === 'badges' && (
            <div className="flex flex-col gap-6">
              {badges.length === 0 ? (
                <p className="text-muted profile-empty">No badges earned yet.</p>
              ) : (
                <BadgeChips badges={badges} />
              )}
              {letterRankBadges.length > 0 && (
                <div>
                  <h6>Letter-writing rank</h6>
                  <LetterRankBadgeChips badges={letterRankBadges} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyProfile
