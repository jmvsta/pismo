import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import type { UiTextKey } from '../../i18n/uiText.ts'
import NewMatchesTab from './NewMatchesTab.tsx'
import PendingMatchesTab from './PendingMatchesTab.tsx'
import HiddenMatchesTab from './HiddenMatchesTab.tsx'
import MatchedTab from './MatchedTab.tsx'
import MatchQuestionnaireDialog from './MatchQuestionnaireDialog.tsx'
import './Matches.css'

type TabId = 'new' | 'pending' | 'hidden' | 'matched'

const TABS: { id: TabId; key: UiTextKey }[] = [
  { id: 'new', key: 'matchesTabNew' },
  { id: 'pending', key: 'matchesTabPending' },
  { id: 'hidden', key: 'matchesTabHidden' },
  { id: 'matched', key: 'matchesTabMatched' },
]

function Matches() {
  const currentUser = useUserStore((state) => state.currentUser)
  const language = useLanguageStore((state) => state.language)
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
          {uiText('backToFeed', language)}
        </Link>
        <h2>{uiText('matchesTitle', language)}</h2>
        <p className="text-muted">{uiText('matchesDescription', language)}</p>
      </div>

      <div className="matches-tabs">
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
