import { useState } from 'react'
import { useLanguageStore } from '../../store/languageStore.ts'
import { uiText } from '../../i18n/uiText.ts'
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

function isPendingDelivery(status: LetterStatus): boolean {
  return status === 'SENT' || status === 'IN_TRANSIT'
}

interface ProfileLettersTableProps {
  rows: LetterRow[]
  onCancel: (letterId: string) => Promise<void>
  onReceive: (letterId: string) => Promise<void>
}

function ProfileLettersTable({ rows, onCancel, onReceive }: ProfileLettersTableProps) {
  const language = useLanguageStore((state) => state.language)
  const [busyId, setBusyId] = useState<string | null>(null)

  const runAction = async (letterId: string, action: (id: string) => Promise<void>) => {
    if (busyId) return
    setBusyId(letterId)
    try {
      await action(letterId)
    } finally {
      setBusyId(null)
    }
  }

  if (rows.length === 0) {
    return <p className="text-muted profile-empty">No letters yet.</p>
  }

  return (
    <div className="table-scroll">
      <table className="table profile-letters-table">
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
              <td className="text-muted profile-letter-since">{formatDate(row.since)}</td>
              <td className="profile-letter-actions">
                {row.direction === 'outgoing' && (row.status === 'DRAFT' || isPendingDelivery(row.status)) && (
                  <button
                    type="button"
                    className="btn btn-icon profile-letter-action"
                    onClick={() => runAction(row.id, onCancel)}
                    disabled={busyId === row.id}
                    aria-label={uiText('letterCancel', language)}
                    title={uiText('letterCancel', language)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
                {row.direction === 'incoming' && isPendingDelivery(row.status) && (
                  <button
                    type="button"
                    className="btn btn-icon profile-letter-action"
                    onClick={() => runAction(row.id, onReceive)}
                    disabled={busyId === row.id}
                    aria-label={uiText('letterMarkReceived', language)}
                    title={uiText('letterMarkReceived', language)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProfileLettersTable
