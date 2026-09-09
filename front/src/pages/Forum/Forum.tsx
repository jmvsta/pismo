import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumReply, ForumTopic } from '../../services/forum/index.ts'
import { useWalletStore } from '../../store/walletStore.ts'
import { useUserStore } from '../../store/userStore.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { SuggestedProfile } from '../../services/matching/index.ts'
import { formatMinorAmount } from '../../lib/money.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import ForumPostCard from './ForumPostCard.tsx'
import ForumNewPostDialog from './ForumNewPostDialog.tsx'
import ForumNewTopicDialog from './ForumNewTopicDialog.tsx'
import ForumPostDetail from './ForumPostDetail.tsx'
import './Forum.css'

type SortMode = 'latest' | 'top' | 'unanswered'

const PAGE_SIZE = 10

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
    const [isNewTopicOpen, setIsNewTopicOpen] = useState(false)
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const { wallet, loadWallet } = useWalletStore()
    const currentUser = useUserStore((state) => state.currentUser)
    const avatarUrl = imageUrl(currentUser?.avatarImageId)
    const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([])
    const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null

    useEffect(() => {
        if (!currentUser) return
        loadWallet()
    }, [loadWallet, currentUser])

    useEffect(() => {
        if (!currentUser) return
        matchingService
            .suggestedProfiles(undefined, 3)
            .then(setSuggestedProfiles)
            .catch(() => {})
    }, [currentUser])

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

    const handlePostThanked = (updated: ForumPost) => {
        setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)))
    }

    const handleReplyAdded = (postId: string, reply: ForumReply) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, replies: [...post.replies, reply], replyCount: post.replyCount + 1 }
                    : post,
            ),
        )
    }

    const handleReplyThanked = (postId: string, updated: ForumReply) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, replies: post.replies.map((reply) => (reply.id === updated.id ? updated : reply)) }
                    : post,
            ),
        )
    }

    const activeTopics = useMemo(() => topics.filter((topic) => topic.active), [topics])
    const frozenTopics = useMemo(() => topics.filter((topic) => !topic.active), [topics])

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
                <Link to="/about" className="nav-link">
                    About us
                </Link>
                {currentUser && (
                    <>
                        <Link to="/matches" className="nav-link">
                            Find a pen pal
                        </Link>
                        <Link to="/profile?tab=penpals" className="nav-link">
                            My pen pals
                        </Link>
                        <span className="forum-wallet-pill">
              Wallet · {wallet ? formatMinorAmount(wallet.balanceMinor, wallet.currency) : '—'}
            </span>
                        <Link
                            to="/profile"
                            className={`forum-nav-avatar${avatarUrl ? '' : ' photo-placeholder'}`}
                            aria-label="My profile"
                        >
                            {avatarUrl && <img src={avatarUrl} alt="" />}
                        </Link>
                    </>
                )}
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
                        {activeTopics.map((topic) => (
                            <span
                                key={topic.id}
                                className={activeTopic === topic.id ? 'is-active' : undefined}
                                onClick={() => setActiveTopic(topic.id)}
                            >
                {topic.title}
              </span>
                        ))}
                        {frozenTopics.length > 0 && <h6 className="forum-topics-frozen-label">Frozen</h6>}
                        {frozenTopics.map((topic) => (
                            <span
                                key={topic.id}
                                className={activeTopic === topic.id ? 'is-active is-frozen' : 'is-frozen'}
                                onClick={() => setActiveTopic(topic.id)}
                            >
                {topic.title}
              </span>
                        ))}
                        <button
                            type="button"
                            className="btn btn-ghost forum-new-topic-btn"
                            onClick={() => setIsNewTopicOpen(true)}
                        >
                            + New topic
                        </button>
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
                        <ForumPostCard
                            key={post.id}
                            post={post}
                            onOpen={(opened) => setSelectedPostId(opened.id)}
                            onThanked={handlePostThanked}
                        />
                    ))}

                    {hasMore && sortMode !== 'unanswered' && (
                        <div className="forum-load-more">
                            <button type="button" className="btn btn-ghost" onClick={handleLoadMore} disabled={loadingMore}>
                                {loadingMore ? 'Loading…' : 'Load more posts ↓'}
                            </button>
                        </div>
                    )}
                </main>

                {currentUser && (
                    <aside className="forum-sidebar-right">
                        <div>
                            <h6>Suggested pen pals</h6>
                            <div className="forum-suggested">
                                {suggestedProfiles.length === 0 && (
                                    <p className="text-muted forum-suggested-empty">No matches yet.</p>
                                )}
                                {suggestedProfiles.map((suggestion) => (
                                    <Link to={`/profile/${suggestion.user.id}`} key={suggestion.user.id} className="forum-suggested-row">
                                        <span>{suggestion.user.nickname}</span>
                                        {suggestion.score !== null && (
                                            <span className="forum-suggested-pct">{Math.round(suggestion.score)}%</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                            <Link to="/matches" className="btn btn-ghost forum-see-all">
                                See all matches →
                            </Link>
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
                )}
            </div>

            {isNewPostOpen && (
                <ForumNewPostDialog
                    topics={topics}
                    onClose={() => setIsNewPostOpen(false)}
                    onCreated={(post) => setPosts((prev) => [post, ...prev])}
                />
            )}

            {isNewTopicOpen && (
                <ForumNewTopicDialog
                    onClose={() => setIsNewTopicOpen(false)}
                    onCreated={(topic) => {
                        setTopics((prev) => [...prev, topic])
                        setActiveTopic(topic.id)
                    }}
                />
            )}

            {selectedPost && (
                <ForumPostDetail
                    post={selectedPost}
                    onClose={() => setSelectedPostId(null)}
                    onPostThanked={handlePostThanked}
                    onReplyAdded={handleReplyAdded}
                    onReplyThanked={handleReplyThanked}
                />
            )}
        </div>
    )
}

export default Forum
