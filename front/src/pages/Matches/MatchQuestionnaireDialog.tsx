import { useEffect, useState } from 'react'
import { questionnaireService } from '../../services/questionnaire/index.ts'
import type { QuestionnaireAnswers, QuestionnaireDefinition } from '../../store/questionnaireDefinition.ts'
import ProfileQuestionnaireAnswers from '../Profile/ProfileQuestionnaireAnswers.tsx'

interface MatchQuestionnaireDialogProps {
  userId: string
  nickname: string
  onClose: () => void
}

function MatchQuestionnaireDialog({ userId, nickname, onClose }: MatchQuestionnaireDialogProps) {
  const [definition, setDefinition] = useState<QuestionnaireDefinition | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const activeVersion = await questionnaireService.activeQuestionnaire('REGISTRATION')
        if (cancelled) return
        if (!activeVersion) {
          setError('No questionnaire is set up yet.')
          return
        }
        setDefinition(JSON.parse(activeVersion.definition) as QuestionnaireDefinition)
        const response = await questionnaireService.userQuestionnaireResponse(userId, activeVersion.id)
        if (cancelled) return
        if (response?.submittedAt) {
          setAnswers(JSON.parse(response.answers) as QuestionnaireAnswers)
          setHasSubmitted(true)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the questionnaire.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal forum-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h5>{nickname}'s questionnaire</h5>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && <p className="text-muted">Loading…</p>}
        {error && <p className="text-muted">{error}</p>}
        {!loading && !error && (
          <ProfileQuestionnaireAnswers definition={definition} answers={answers} hasSubmitted={hasSubmitted} />
        )}
      </div>
    </div>
  )
}

export default MatchQuestionnaireDialog
