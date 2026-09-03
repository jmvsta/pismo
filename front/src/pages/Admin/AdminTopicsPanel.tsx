import { useEffect, useState, type FormEvent } from 'react'
import { forumService } from '../../services/forum/index.ts'
import type { ForumTopic } from '../../services/forum/index.ts'
import { useUserStore } from '../../store/userStore.ts'

type PanelStatus = 'idle' | 'loading' | 'ready' | 'error'

function AdminTopicsPanel() {
  const currentUser = useUserStore((state) => state.currentUser)
  const isAdmin = currentUser?.role === 'ADMIN'
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [newCode, setNewCode] = useState('')
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    let cancelled = false

    forumService
      .forumTopics()
      .then((data) => {
        if (cancelled) return
        setTopics(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load topics.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleToggleActive = async (topic: ForumTopic) => {
    setError(null)
    try {
      const updated = await forumService.setForumTopicActive(topic.id, !topic.active)
      setTopics((current) => current.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the topic.')
    }
  }

  const handleDelete = async (topic: ForumTopic) => {
    if (!window.confirm(`Remove "${topic.title}"? This can't be undone.`)) return
    setError(null)
    try {
      await forumService.deleteForumTopic(topic.id)
      setTopics((current) => current.filter((t) => t.id !== topic.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove the topic.')
    }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!newCode.trim() || !newTitle.trim()) return
    setError(null)
    try {
      const created = await forumService.createForumTopic({ code: newCode.trim(), title: newTitle.trim() })
      setTopics((current) => [...current, created])
      setNewCode('')
      setNewTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create the topic.')
    }
  }

  if (status === 'idle' || status === 'loading') {
    return <p className="text-muted admin-empty">Loading topics…</p>
  }

  if (status === 'error') {
    return <p className="text-muted admin-empty">{error}</p>
  }

  return (
    <div>
      {error && <p className="text-muted admin-empty">{error}</p>}
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id}>
                <td>{topic.title}</td>
                <td className="text-muted">{topic.code}</td>
                <td>
                  <span className={topic.active ? 'tag tag-accent' : 'tag tag-neutral'}>
                    {topic.active ? 'Active' : 'Frozen'}
                  </span>
                </td>
                <td className="admin-editor-row">
                  <button type="button" className="btn btn-secondary" onClick={() => handleToggleActive(topic)}>
                    {topic.active ? 'Freeze' : 'Unfreeze'}
                  </button>
                  {/* Moderators can freeze/unfreeze but not delete topics. */}
                  {isAdmin && (
                    <button type="button" className="btn btn-ghost" onClick={() => handleDelete(topic)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Creating new topics is admin-only -- not one of the actions moderators were granted. */}
      {isAdmin && (
        <form className="admin-editor-row admin-new-topic-form" onSubmit={handleCreate}>
          <input
            className="input"
            placeholder="code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          <input
            className="input"
            placeholder="title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            + Topic
          </button>
        </form>
      )}
    </div>
  )
}

export default AdminTopicsPanel
