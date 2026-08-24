import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Forum.css'

type Topic = 'Letter writing' | 'Received letters' | 'Pen pal search' | 'Announcements'
type SortMode = 'latest' | 'top' | 'unanswered'

interface Post {
  id: string
  topic: Topic
  author: string
  time: string
  title: string
  excerpt: string
  photo?: boolean
  replies: number
  thanks?: number
  matchPct?: number
}

const TOPICS: Topic[] = ['Letter writing', 'Received letters', 'Pen pal search', 'Announcements']

const POSTS: Post[] = [
  {
    id: 'p1',
    topic: 'Received letters',
    author: 'Kenji · Osaka',
    time: '2 h ago',
    title: "Marta's letter crossed 10,000 km — look at these stamps",
    excerpt:
      'Three weeks in transit, arrived smelling faintly of coffee. The wax seal survived. This is why I quit Instagram.',
    photo: true,
    replies: 64,
    thanks: 128,
  },
  {
    id: 'p2',
    topic: 'Pen pal search',
    author: 'Louise · Lyon',
    time: '5 h ago',
    title: 'Looking for a pen pal who also thinks cheese is a personality trait',
    excerpt: 'One letter a fortnight, real paper, no pressure. Comté enthusiasts to the front.',
    replies: 18,
    matchPct: 74,
  },
  {
    id: 'p3',
    topic: 'Letter writing',
    author: 'Tomás · Buenos Aires',
    time: 'yesterday',
    title: 'How do you start a first letter to a total stranger?',
    excerpt: "Matched at 88% with someone in Helsinki and I've been staring at a blank page for two days.",
    replies: 31,
    thanks: 42,
  },
]

const SUGGESTED = [
  { name: 'Kenji · Osaka', pct: 91 },
  { name: 'Ana · Porto', pct: 87 },
  { name: 'Louise · Lyon', pct: 74 },
]

function Forum() {
  const [activeTopic, setActiveTopic] = useState<Topic | 'all'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('latest')

  const visiblePosts = useMemo(() => {
    let posts = activeTopic === 'all' ? POSTS : POSTS.filter((p) => p.topic === activeTopic)
    if (sortMode === 'top') {
      posts = [...posts].sort((a, b) => b.replies - a.replies)
    } else if (sortMode === 'unanswered') {
      posts = posts.filter((p) => p.replies === 0)
    }
    return posts
  }, [activeTopic, sortMode])

  return (
    <div className="forum-page">
      <div className="nav">
        <Link to="/" className="nav-brand">
          PISMO NA DAR
        </Link>
        <Link to="/" className="nav-link" aria-current="page">
          Feed
        </Link>
        <span className="nav-link nav-link-static">Find a pen pal</span>
        <span className="nav-link nav-link-static">My letters</span>
        <span className="forum-wallet-pill">Wallet · € 4.50</span>
        <Link to="/profile" className="photo-placeholder forum-nav-avatar" aria-label="My profile" />
      </div>

      <div className="forum-body">
        <aside className="forum-sidebar-left">
          <button type="button" className="btn btn-primary btn-block forum-new-post">
            + New post
          </button>
          <div className="forum-topics">
            <h6>Topics</h6>
            <span
              className={activeTopic === 'all' ? 'is-active' : undefined}
              onClick={() => setActiveTopic('all')}
            >
              All posts
            </span>
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className={activeTopic === topic ? 'is-active' : undefined}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </span>
            ))}
          </div>
        </aside>

        <main className="forum-feed">
          <div className="forum-sort">
            <span className={sortMode === 'latest' ? 'is-active' : undefined} onClick={() => setSortMode('latest')}>
              Latest
            </span>
            <span className={sortMode === 'top' ? 'is-active' : undefined} onClick={() => setSortMode('top')}>
              Top this week
            </span>
            <span
              className={sortMode === 'unanswered' ? 'is-active' : undefined}
              onClick={() => setSortMode('unanswered')}
            >
              Unanswered
            </span>
          </div>

          {visiblePosts.length === 0 && (
            <p className="text-muted forum-empty">Nothing here yet — check back later.</p>
          )}

          {visiblePosts.map((post) => (
            <article key={post.id} className="forum-post">
              <div className="forum-post-meta">
                <span className="tag tag-accent">{post.topic}</span>
                <span className="text-muted">
                  {post.author} · {post.time}
                </span>
              </div>
              <div className="forum-post-title">{post.title}</div>
              <div className="forum-post-content">
                <p className="text-muted forum-post-excerpt">{post.excerpt}</p>
                {post.photo && (
                  <div className="photo-placeholder forum-post-photo">
                    <span>letter photo</span>
                  </div>
                )}
              </div>
              <div className="forum-post-footer text-muted">
                <span>{post.replies} replies</span>
                {post.thanks !== undefined && <span>{post.thanks} thanks</span>}
                {post.matchPct !== undefined && (
                  <span className="tag tag-outline forum-post-match">{post.matchPct}% match with you</span>
                )}
              </div>
            </article>
          ))}

          <div className="forum-load-more">
            <button type="button" className="btn btn-ghost">
              Load more posts ↓
            </button>
          </div>
        </main>

        <aside className="forum-sidebar-right">
          <div>
            <h6>Suggested pen pals</h6>
            <div className="forum-suggested">
              {SUGGESTED.map((person) => (
                <Link to="/profile" key={person.name} className="forum-suggested-row">
                  <span>{person.name}</span>
                  <span className="forum-suggested-pct">{person.pct}%</span>
                </Link>
              ))}
            </div>
            <button type="button" className="btn btn-ghost forum-see-all">
              See all matches →
            </button>
          </div>

          <div className="forum-plus-box">
            <div className="forum-plus-title">DAR Plus</div>
            <div className="forum-plus-copy">
              Unlimited matches, letter tracking abroad, wallet top-up bonus. € 3 / month.
            </div>
            <button type="button" className="btn forum-plus-btn">
              Subscribe →
            </button>
          </div>

          <div className="forum-wallet-box">
            <h6>Wallet</h6>
            <div className="forum-wallet-amount">€ 4.50</div>
            <div className="text-muted forum-wallet-hint">covers ~3 international stamps</div>
            <button type="button" className="btn btn-secondary forum-wallet-btn">
              Top up →
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Forum
