import type { LetterStatus } from '../../services/letters/index.ts'
import type { LetterRow } from './letterRows.ts'

function isInProgressStatus(status: LetterStatus): boolean {
  return status === 'SENT' || status === 'IN_TRANSIT'
}

function formatLetterStatus(status: LetterStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ProfileLettersTableProps {
  rows: LetterRow[]
}

function ProfileLettersTable({ rows }: ProfileLettersTableProps) {
  if (rows.length === 0) {
    return <p className="text-muted profile-empty">No letters yet.</p>
  }

  return (
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
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="profile-letter-name">{row.penPalName}</td>
            <td>{row.direction === 'outgoing' ? '→ outgoing' : '← incoming'}</td>
            <td>
              <span className={isInProgressStatus(row.status) ? 'tag tag-accent' : 'tag tag-neutral'}>
                {formatLetterStatus(row.status)}
              </span>
            </td>
            <td className="text-muted">{formatDate(row.since)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProfileLettersTable
