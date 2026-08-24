import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Profile.css'

type TabId = 'letters' | 'forum' | 'questionnaire' | 'badges'

const TABS: { id: TabId; label: string }[] = [
  { id: 'letters', label: 'Letters' },
  { id: 'forum', label: 'Forum posts' },
  { id: 'questionnaire', label: 'Questionnaire' },
  { id: 'badges', label: 'Badges' },
]

const LETTERS = [
  { penPal: 'Kenji · Osaka, JP', direction: '→ outgoing', status: 'In transit', since: '12 Aug 2026' },
  { penPal: 'Ana · Porto, PT', direction: '← incoming', status: 'In transit', since: '17 Aug 2026' },
  { penPal: 'Louise · Lyon, FR', direction: '→ outgoing', status: 'Delivered', since: '29 Jul 2026' },
  {
    penPal: 'Tomás · Buenos Aires, AR',
    direction: '← incoming',
    status: 'Delivered',
    since: '15 Jul 2026',
  },
]

function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>('letters')
  const [requestSent, setRequestSent] = useState(false)

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">
          ← Back to feed
        </Link>

        <div className="profile-header">
          <div className="photo-placeholder profile-avatar">
            <span>avatar</span>
          </div>
          <div className="profile-identity">
            <div className="profile-name-row">
              <h2>marta.writes</h2>
              <span className="text-muted">Lisbon, Portugal · member since March 2026</span>
            </div>
            <p className="profile-bio">
              I believe a letter is the best gift. Corresponding with four strangers on three
              continents. Fountain pens, bad puns, good cheese.
            </p>
            <div className="profile-badges">
              <span className="tag tag-accent">First letter sent</span>
              <span className="tag tag-accent">10 countries reached</span>
              <span className="tag tag-neutral">Questionnaire 100%</span>
            </div>
          </div>
          <div className="profile-match">
            <div className="profile-match-pct">82%</div>
            <div className="profile-match-label">match with you</div>
            <div className="profile-match-shared">
              You share: pottery, coffee, long letters, hiking, Terry Pratchett
            </div>
            <button
              type="button"
              className="btn profile-request-btn"
              disabled={requestSent}
              onClick={() => setRequestSent(true)}
            >
              {requestSent ? 'Request sent ✓' : 'Request pen pal →'}
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">34</div>
            <div className="text-muted">letters sent</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">29</div>
            <div className="text-muted">letters received</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">4</div>
            <div className="text-muted">active pen pals</div>
          </div>
          <div className="profile-stat profile-stat-last">
            <div className="profile-stat-value">12</div>
            <div className="text-muted">forum posts</div>
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

          {activeTab === 'letters' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Pen pal</th>
                  <th>Direction</th>
                  <th>Status</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {LETTERS.map((letter) => (
                  <tr key={letter.penPal}>
                    <td className="profile-letter-name">{letter.penPal}</td>
                    <td>{letter.direction}</td>
                    <td>
                      <span className={letter.status === 'In transit' ? 'tag tag-accent' : 'tag tag-neutral'}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="text-muted">{letter.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'forum' && <p className="text-muted profile-empty">No forum posts to show yet.</p>}
          {activeTab === 'questionnaire' && (
            <p className="text-muted profile-empty">Questionnaire answers are private.</p>
          )}
          {activeTab === 'badges' && <p className="text-muted profile-empty">No badges earned yet.</p>}
        </div>
      </div>
    </div>
  )
}

export default Profile
