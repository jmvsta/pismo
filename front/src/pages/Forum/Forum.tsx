import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { forumService } from '../../services/forum/index.ts'
import type { ForumPost, ForumReply, ForumTopic } from '../../services/forum/index.ts'
import { useUserStore } from '../../store/userStore.ts'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
import { matchingService } from '../../services/matching/index.ts'
import type { SuggestedProfile } from '../../services/matching/index.ts'
import { imageUrl } from '../../services/imageUrl.ts'
import { renderRichText } from '../../lib/richText.tsx'
import ForumPostCard from './ForumPostCard.tsx'
import ForumNewPostDialog from './ForumNewPostDialog.tsx'
import ForumNewTopicDialog from './ForumNewTopicDialog.tsx'
import ForumPostDetail from './ForumPostDetail.tsx'
import './Forum.css'

type SortMode = 'latest' | 'top' | 'unanswered'

const PAGE_SIZE = 10

function Forum() {
    const language = useLanguageStore((state) => state.language)
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
    const [isTopicsOpen, setIsTopicsOpen] = useState(false)
    const currentUser = useUserStore((state) => state.currentUser)
    const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([])
    const [letterRequestState, setLetterRequestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [showScrollTop, setShowScrollTop] = useState(false)
    const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 600)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    const handleRequestLetter = async () => {
        if (letterRequestState === 'sending' || letterRequestState === 'sent') return
        setLetterRequestState('sending')
        try {
            await matchingService.requestLetterFromModerators()
            setLetterRequestState('sent')
        } catch {
            setLetterRequestState('error')
        }
    }

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

    const handlePostUpdated = (updated: ForumPost) => {
        setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)))
    }

    const handlePostDeleted = (postId: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== postId))
        setSelectedPostId(null)
    }

    const handleReplyUpdated = (postId: string, updated: ForumReply) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, replies: post.replies.map((reply) => (reply.id === updated.id ? updated : reply)) }
                    : post,
            ),
        )
    }

    const handleReplyDeleted = (postId: string, replyId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          replies: post.replies.filter((reply) => reply.id !== replyId),
                          replyCount: Math.max(0, post.replyCount - 1),
                      }
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
            <div className="forum-body">
                <aside className="forum-sidebar-left">
                    {currentUser && (
                        <button
                            type="button"
                            className="btn btn-primary btn-block forum-new-post"
                            onClick={() => setIsNewPostOpen(true)}
                        >
                            {uiText('forumNewPost', language)}
                        </button>
                    )}
                    <div className="forum-topics">
                        <h6 className="forum-topics-toggle" onClick={() => setIsTopicsOpen((prev) => !prev)}>
                            {uiText('forumTopics', language)}
                        </h6>
                        <div className={`forum-topics-list${isTopicsOpen ? ' is-open' : ''}`}>
                            <span
                                className={activeTopic === 'all' ? 'is-active' : undefined}
                                onClick={() => setActiveTopic('all')}
                            >
              {uiText('forumAllPosts', language)}
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
                            {frozenTopics.length > 0 && (
                                <h6 className="forum-topics-frozen-label">{uiText('forumFrozen', language)}</h6>
                            )}
                            {frozenTopics.map((topic) => (
                                <span
                                    key={topic.id}
                                    className={activeTopic === topic.id ? 'is-active is-frozen' : 'is-frozen'}
                                    onClick={() => setActiveTopic(topic.id)}
                                >
                {topic.title}
              </span>
                            ))}
                            {currentUser && (
                                <button
                                    type="button"
                                    className="btn btn-ghost forum-new-topic-btn"
                                    onClick={() => setIsNewTopicOpen(true)}
                                >
                                    {uiText('forumNewTopic', language)}
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="forum-feed">
                    <div className="forum-sort">
            <span className={sortMode === 'latest' ? 'is-active' : undefined} onClick={() => setSortMode('latest')}>
              {uiText('forumLatest', language)}
            </span>
                        <span className={sortMode === 'top' ? 'is-active' : undefined} onClick={() => setSortMode('top')}>
              {uiText('forumTopThisWeek', language)}
            </span>
                        <span
                            className={sortMode === 'unanswered' ? 'is-active' : undefined}
                            onClick={() => setSortMode('unanswered')}
                        >
              {uiText('forumUnanswered', language)}
            </span>
                    </div>

                    {feedError && <p className="text-muted forum-empty">{feedError}</p>}

                    {!feedError && visiblePosts.length === 0 && (
                        <p className="text-muted forum-empty">{uiText('forumNothingHere', language)}</p>
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
                                {loadingMore ? uiText('forumLoading', language) : uiText('forumLoadMore', language)}
                            </button>
                        </div>
                    )}
                </main>

                {currentUser && (
                    <aside className="forum-sidebar-right">
                        <div>
                            <h6>{uiText('forumSuggestedPenPals', language)}</h6>
                            <div className="forum-suggested">
                                {suggestedProfiles.length === 0 && (
                                    <p className="text-muted forum-suggested-empty">No matches yet.</p>
                                )}
                                {suggestedProfiles.map((suggestion) => {
                                    const avatarUrl = imageUrl(suggestion.user.avatarImageId)
                                    return (
                                        <Link to={`/profile/${suggestion.user.id}`} key={suggestion.user.id} className="forum-suggested-row">
                                            <div className={`forum-suggested-avatar${avatarUrl ? '' : ' photo-placeholder'}`}>
                                                {avatarUrl && <img src={avatarUrl} alt={suggestion.user.nickname} />}
                                            </div>
                                            <div className="forum-suggested-info">
                                                <div className="forum-suggested-heading">
                                                    <span>{suggestion.user.nickname}</span>
                                                    {suggestion.score !== null && (
                                                        <span className="forum-suggested-pct">{Math.round(suggestion.score)}%</span>
                                                    )}
                                                </div>
                                                {suggestion.user.bio && (
                                                    <div className="text-muted forum-suggested-bio">
                                                        {renderRichText(suggestion.user.bio)}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                            <Link to="/matches" className="btn btn-ghost forum-see-all">
                                {uiText('forumSeeAllRecommended', language)}
                            </Link>
                        </div>

                        <button
                            type="button"
                            className="forum-mailbox-box"
                            onClick={handleRequestLetter}
                            disabled={letterRequestState === 'sending' || letterRequestState === 'sent'}
                        >
                            <svg
                                className="forum-mailbox-icon"
                                viewBox="0 0 24 24"
                                width="36"
                                height="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M4 11a5 5 0 0 1 10 0v7H4z" />
                                <rect x="14" y="9" width="4" height="4" />
                                <line x1="9" y1="18" x2="9" y2="22" />
                                <line x1="5" y1="22" x2="13" y2="22" />
                            </svg>
                            <div className="forum-mailbox-title">{uiText('forumMailboxTitle', language)}</div>
                            {letterRequestState === 'sent' ? (
                                <div className="forum-mailbox-copy">{uiText('forumMailboxSent', language)}</div>
                            ) : letterRequestState === 'error' ? (
                                <div className="forum-mailbox-copy">{uiText('forumMailboxError', language)}</div>
                            ) : (
                                <div className="forum-mailbox-copy">{uiText('forumMailboxCopy', language)}</div>
                            )}
                        </button>
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
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                    onReplyAdded={handleReplyAdded}
                    onReplyThanked={handleReplyThanked}
                    onReplyUpdated={handleReplyUpdated}
                    onReplyDeleted={handleReplyDeleted}
                />
            )}

            {showScrollTop && (
                <button
                    type="button"
                    className="forum-scroll-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    ↑
                </button>
            )}
        </div>
    )
}

export default Forum
