import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumTopic } from '../../services/forum/index.ts'
import { useWalletStore } from '../../store/walletStore.ts'
import { formatMinorAmount } from '../../lib/money.ts'
import ForumPostCard from './ForumPostCard.tsx'
import ForumNewPostDialog from './ForumNewPostDialog.tsx'
import './Forum.css'

type SortMode = 'latest' | 'top' | 'unanswered'

const PAGE_SIZE = 10

const SUGGESTED = [
  { name: 'Kenji · Osaka', pct: 91 },
  { name: 'Ana · Porto', pct: 87 },
  { name: 'Louise · Lyon', pct: 74 },
]

function Forum() {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [activeTopic, setActiveTopic] = useState<string | 'all'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [isNewPostOpen, setIsNewPostOpen] = useState(false)
  const { wallet, loadWallet } = useWalletStore()

  useEffect(() => {
    loadWallet()
  }, [loadWallet])

  useEffect(() => {
    forumService
      .forumTopics()
      .then(setTopics)
      .catch((err) => setFeedError(err instanceof Error ? err.message : 'Could not load topics.'))
  }, [])

  useEffect(() => {
    let cancelled = false
    const topicId = activeTopic === 'all' ? undefined : activeTopic

    forumService
      .forumPosts(topicId, PAGE_SIZE, 0)
      .then((page) => {
        if (cancelled) return
        setPosts(page)
        setOffset(page.length)
        setHasMore(page.length === PAGE_SIZE)
        setFeedError(null)
      })
      .catch((err) => {
        if (!cancelled) setFeedError(err instanceof Error ? err.message : 'Could not load posts.')
      })

    return () => {
      cancelled = true
    }
  }, [activeTopic])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const topicId = activeTopic === 'all' ? undefined : activeTopic
      const page = await forumService.forumPosts(topicId, PAGE_SIZE, offset)
      setPosts((prev) => [...prev, ...page])
      setOffset((prev) => prev + page.length)
      setHasMore(page.length === PAGE_SIZE)
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Could not load more posts.')
    } finally {
      setLoadingMore(false)
    }
  }

  const visiblePosts = useMemo(() => {
    if (sortMode === 'top') {
      return [...posts].sort((a, b) => b.replyCount - a.replyCount)
    }
    if (sortMode === 'unanswered') {
      return posts.filter((post) => post.replyCount === 0)
    }
    return posts
  }, [posts, sortMode])

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
        <span className="forum-wallet-pill">
          Wallet · {wallet ? formatMinorAmount(wallet.balanceMinor, wallet.currency) : '—'}
        </span>
        <Link to="/profile" className="photo-placeholder forum-nav-avatar" aria-label="My profile" />
      </div>

      <div className="forum-body">
        <aside className="forum-sidebar-left">
          <button
            type="button"
            className="btn btn-primary btn-block forum-new-post"
            onClick={() => setIsNewPostOpen(true)}
          >
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
            {topics.map((topic) => (
              <span
                key={topic.id}
                className={activeTopic === topic.id ? 'is-active' : undefined}
                onClick={() => setActiveTopic(topic.id)}
              >
                {topic.title}
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

          {feedError && <p className="text-muted forum-empty">{feedError}</p>}

          {!feedError && visiblePosts.length === 0 && (
            <p className="text-muted forum-empty">Nothing here yet — check back later.</p>
          )}

          {visiblePosts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}

          {hasMore && sortMode !== 'unanswered' && (
            <div className="forum-load-more">
              <button type="button" className="btn btn-ghost" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more posts ↓'}
              </button>
            </div>
          )}
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
            <div className="forum-wallet-amount">
              {wallet ? formatMinorAmount(wallet.balanceMinor, wallet.currency) : '—'}
            </div>
            <div className="text-muted forum-wallet-hint">covers ~3 international stamps</div>
            <Link to="/wallet" className="btn btn-secondary forum-wallet-btn">
              Top up →
            </Link>
          </div>
        </aside>
      </div>

      {isNewPostOpen && (
        <ForumNewPostDialog
          topics={topics}
          onClose={() => setIsNewPostOpen(false)}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />
      )}
    </div>
  )
}

export default Forum
