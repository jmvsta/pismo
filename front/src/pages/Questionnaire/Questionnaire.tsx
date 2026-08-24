import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionnaireStore } from '../../store/questionnaireStore.ts'
import QuestionnaireQuestion from './QuestionnaireQuestion.tsx'
import './Questionnaire.css'

function Questionnaire() {
  const navigate = useNavigate()
  const { definition, answers, status, error, load, setAnswer, save, submit } = useQuestionnaireStore()
  const [sectionIndex, setSectionIndex] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    load('REGISTRATION')
  }, [load])

  const sections = definition?.sections ?? []
  const currentSection = sections[sectionIndex]
  const questionsInSection = useMemo(
    () => definition?.questions.filter((question) => question.section === currentSection?.code) ?? [],
    [definition, currentSection],
  )
  const totalQuestions = definition?.questions.length ?? 0
  const answeredCount = Object.keys(answers).length
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)
  const isLastSection = sectionIndex === sections.length - 1

  const handleContinue = async () => {
    setActionError(null)
    try {
      await save()
      if (isLastSection) {
        await submit()
        navigate('/')
      } else {
        setSectionIndex((index) => index + 1)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save your answers.')
    }
  }

  const handleFinishLater = async () => {
    setActionError(null)
    try {
      await save()
      navigate('/')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save your answers.')
    }
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="questionnaire-page">
        <p className="text-muted">Loading questionnaire…</p>
      </div>
    )
  }

  if (status === 'error' || !definition || !currentSection) {
    return (
      <div className="questionnaire-page">
        <p className="text-muted">{error ?? 'Could not load the questionnaire.'}</p>
      </div>
    )
  }

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-card">
        <aside className="questionnaire-sidebar">
          <h6>Sections</h6>
          <nav className="questionnaire-sections">
            {sections.map((section, index) => (
              <button
                key={section.code}
                type="button"
                className={index === sectionIndex ? 'is-current' : undefined}
                onClick={() => setSectionIndex(index)}
              >
                {section.title}
              </button>
            ))}
          </nav>
          <div className="questionnaire-progress">
            <div className="questionnaire-progress-label">
              {answeredCount} of {totalQuestions} answered
            </div>
            <div className="questionnaire-progress-track">
              <div className="questionnaire-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </aside>

        <div className="questionnaire-body">
          <div>
            <h6>Questionnaire</h6>
            <h3>Tell us who you are</h3>
            <p className="text-muted questionnaire-intro">
              Your answers drive matching — the more honest, the better your pen pals.
            </p>
          </div>

          {questionsInSection.map((question) => (
            <QuestionnaireQuestion
              key={question.key}
              question={question}
              value={answers[question.key]}
              onChange={(value) => setAnswer(question.key, value)}
            />
          ))}

          <div className="questionnaire-actions">
            <button type="button" className="btn btn-primary" onClick={handleContinue}>
              {isLastSection ? 'Submit →' : 'Save and continue →'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleFinishLater}>
              Finish later
            </button>
            {actionError && <span className="text-muted questionnaire-more">{actionError}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Questionnaire
