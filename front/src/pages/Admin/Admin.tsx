import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AdminUsersPanel from './AdminUsersPanel.tsx'
import AdminTopicsPanel from './AdminTopicsPanel.tsx'
import AdminQuestionnairePanel from './AdminQuestionnairePanel.tsx'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import type { UiTextKey } from '../../i18n/uiText.ts'
import './Admin.css'

type AdminTabId = 'users' | 'questionnaire' | 'topics'

const TABS: { id: AdminTabId; key: UiTextKey }[] = [
  { id: 'users', key: 'adminTabUsers' },
  { id: 'questionnaire', key: 'adminTabQuestionnaire' },
  { id: 'topics', key: 'adminTabTopics' },
]

function Admin() {
  const currentUser = useUserStore((state) => state.currentUser)
  const status = useUserStore((state) => state.status)
  const language = useLanguageStore((state) => state.language)
  const [activeTab, setActiveTab] = useState<AdminTabId>('users')

  const canModerate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR'
  // Wait for the initial loadCurrentUser() to settle before deciding -- otherwise a logged-in
  // admin gets bounced for a frame while currentUser is still null on first render.
  if (status !== 'idle' && status !== 'loading' && !canModerate) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <Link to="/" className="admin-back">
          {uiText('backToFeed', language)}
        </Link>

        <div className="admin-header">
          <h6>{uiText('adminEyebrow', language)}</h6>
          <h2>{uiText('adminModeration', language)}</h2>
          <p className="text-muted text-sm">
            Looking to edit the About page? Use the <Link to="/about">Edit page</Link> button there instead.
          </p>
        </div>

        <div className="admin-tabs">
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

        {activeTab === 'users' && <AdminUsersPanel />}
        {activeTab === 'topics' && <AdminTopicsPanel />}
        {activeTab === 'questionnaire' && <AdminQuestionnairePanel />}
      </div>
    </div>
  )
}

export default Admin
