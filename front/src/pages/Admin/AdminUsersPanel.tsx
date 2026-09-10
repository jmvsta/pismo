import { useEffect, useState } from 'react'
import { userService } from '../../services/user/index.ts'
import type { User, UserRole, UserStatus } from '../../services/user/index.ts'
import { useUserStore } from '../../store/userStore.ts'

const ROLES: UserRole[] = ['USER', 'MODERATOR', 'ADMIN']

type PanelStatus = 'idle' | 'loading' | 'ready' | 'error'

function AdminUsersPanel() {
  const currentUser = useUserStore((state) => state.currentUser)
  const isAdmin = currentUser?.role === 'ADMIN'
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    function load() {
      setStatus('loading')
      userService
        .users()
        .then((data) => {
          if (cancelled) return
          setUsers(data)
          setStatus('ready')
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'Failed to load users.')
          setStatus('error')
        })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setError(null)
    try {
      const updated = await userService.setUserRole(userId, role)
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the role.')
    }
  }

  const handleToggleStatus = async (user: User) => {
    setError(null)
    const nextStatus: UserStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    try {
      const updated = await userService.setUserStatus(user.id, nextStatus)
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the status.')
    }
  }

  if (status === 'idle' || status === 'loading') {
    return <p className="text-muted admin-empty">Loading users…</p>
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
              <th>Nickname</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id
              return (
                <tr key={user.id}>
                  <td>{user.nickname}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="input"
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Moderators can't change roles -- read-only.
                      <span>{user.role}</span>
                    )}
                  </td>
                  <td>
                    <span className={user.status === 'SUSPENDED' ? 'tag tag-neutral' : 'tag tag-accent'}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={isSelf}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'SUSPENDED' ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsersPanel
