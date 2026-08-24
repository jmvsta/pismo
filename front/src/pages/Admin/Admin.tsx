import { useState } from 'react'
import './Admin.css'

type AdminTabId = 'users' | 'questionnaire' | 'topics'

const TABS: { id: AdminTabId; label: string; unavailableReason: string }[] = [
  {
    id: 'users',
    label: 'Users',
    unavailableReason:
      "User moderation isn't available yet — the backend has no query to list users and no mutation to change a user's status or role.",
  },
  {
    id: 'questionnaire',
    label: 'Questionnaire',
    unavailableReason:
      "Questionnaire moderation isn't available yet — the backend can only fetch the current user's own response, not list versions or responses across users.",
  },
  {
    id: 'topics',
    label: 'Topics',
    unavailableReason:
      "Topic moderation isn't available yet — forum topics can be read, but there's no mutation to create, edit, or deactivate one.",
  },
]

function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('users')
  const activeTabConfig = TABS.find((tab) => tab.id === activeTab)

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

        <p className="text-muted admin-empty">{activeTabConfig?.unavailableReason}</p>
      </div>
    </div>
  )
}

export default Admin
