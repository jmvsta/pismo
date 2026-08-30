import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import NewMatchesTab from './NewMatchesTab.tsx'
import PendingMatchesTab from './PendingMatchesTab.tsx'
import HiddenMatchesTab from './HiddenMatchesTab.tsx'
import MatchedTab from './MatchedTab.tsx'
import MatchQuestionnaireDialog from './MatchQuestionnaireDialog.tsx'
import './Matches.css'

type TabId = 'new' | 'pending' | 'hidden' | 'matched'

const TABS: { id: TabId; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'pending', label: 'Pending' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'matched', label: 'Matched' },
]

function Matches() {
  const currentUser = useUserStore((state) => state.currentUser)
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = TABS.some((tab) => tab.id === requestedTab) ? (requestedTab as TabId) : 'new'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [questionnaireTarget, setQuestionnaireTarget] = useState<{ userId: string; nickname: string } | null>(null)

  const handleViewQuestionnaire = (userId: string, nickname: string) => setQuestionnaireTarget({ userId, nickname })

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

      <div className="matches-tabs">
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

      {activeTab === 'new' && <NewMatchesTab onViewQuestionnaire={handleViewQuestionnaire} />}
      {activeTab === 'pending' && <PendingMatchesTab onViewQuestionnaire={handleViewQuestionnaire} />}
      {activeTab === 'hidden' && <HiddenMatchesTab onViewQuestionnaire={handleViewQuestionnaire} />}
      {activeTab === 'matched' && <MatchedTab />}

      {questionnaireTarget && (
        <MatchQuestionnaireDialog
          userId={questionnaireTarget.userId}
          nickname={questionnaireTarget.nickname}
          onClose={() => setQuestionnaireTarget(null)}
        />
      )}
    </div>
  )
}

export default Matches
