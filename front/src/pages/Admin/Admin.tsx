import { useState } from 'react'
import AdminUsersPanel from './AdminUsersPanel.tsx'
import AdminTopicsPanel from './AdminTopicsPanel.tsx'
import AdminQuestionnairePanel from './AdminQuestionnairePanel.tsx'
import './Admin.css'

type AdminTabId = 'users' | 'questionnaire' | 'topics'

const TABS: { id: AdminTabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'questionnaire', label: 'Questionnaire' },
  { id: 'topics', label: 'Topics' },
]

function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('users')

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <h6>Admin</h6>
          <h2>Moderation</h2>
        </div>

        <div className="admin-tabs">
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

        {activeTab === 'users' && <AdminUsersPanel />}
        {activeTab === 'topics' && <AdminTopicsPanel />}
        {activeTab === 'questionnaire' && <AdminQuestionnairePanel />}
      </div>
    </div>
  )
}

export default Admin
