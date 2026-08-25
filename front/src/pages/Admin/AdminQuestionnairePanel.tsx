import { useEffect, useState } from 'react'
import { questionnaireService } from '../../services/questionnaire/index.ts'
import type { QuestionnaireKind, QuestionnaireVersion } from '../../services/questionnaire/index.ts'
import type {
  QuestionnaireDefinition,
  QuestionnaireOptionDef,
  QuestionnaireQuestionDef,
  QuestionnaireQuestionType,
  QuestionnaireSectionDef,
} from '../../store/questionnaireDefinition.ts'

const KINDS: QuestionnaireKind[] = ['REGISTRATION', 'EXPERIENCE']
const QUESTION_TYPES: QuestionnaireQuestionType[] = ['single', 'single_or_free', 'multi']

type PanelStatus = 'idle' | 'loading' | 'ready' | 'error'

function emptyDefinition(): QuestionnaireDefinition {
  return { version: 1, sections: [], questions: [] }
}

function AdminQuestionnairePanel() {
  const [kind, setKind] = useState<QuestionnaireKind>('REGISTRATION')
  const [versions, setVersions] = useState<QuestionnaireVersion[]>([])
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<QuestionnaireDefinition | null>(null)
  const [saving, setSaving] = useState(false)

  const loadVersions = (k: QuestionnaireKind) => {
    questionnaireService
      .questionnaireVersions(k)
      .then((data) => {
        setVersions(data)
        setStatus('ready')
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load questionnaire versions.')
        setStatus('error')
      })
  }

  const handleKindChange = (k: QuestionnaireKind) => {
    setEditing(null)
    setKind(k)
  }

  useEffect(() => {
    loadVersions(kind)
  }, [kind])

  const addSection = () => {
    setEditing((current) => current && { ...current, sections: [...current.sections, { code: '', title: '' }] })
  }

  const updateSection = (index: number, patch: Partial<QuestionnaireSectionDef>) => {
    setEditing(
      (current) =>
        current && {
          ...current,
          sections: current.sections.map((section, i) => (i === index ? { ...section, ...patch } : section)),
        },
    )
  }

  const removeSection = (index: number) => {
    setEditing((current) => {
      if (!current) return current
      const removed = current.sections[index]
      return {
        ...current,
        sections: current.sections.filter((_, i) => i !== index),
        questions: current.questions.filter((question) => question.section !== removed.code),
      }
    })
  }

  const addQuestion = () => {
    setEditing(
      (current) =>
        current && {
          ...current,
          questions: [
            ...current.questions,
            { key: '', type: 'single', section: current.sections[0]?.code ?? '', text: '', options: [] },
          ],
        },
    )
  }

  const updateQuestion = (index: number, patch: Partial<QuestionnaireQuestionDef>) => {
    setEditing(
      (current) =>
        current && {
          ...current,
          questions: current.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)),
        },
    )
  }

  const removeQuestion = (index: number) => {
    setEditing(
      (current) => current && { ...current, questions: current.questions.filter((_, i) => i !== index) },
    )
  }

  const addOption = (questionIndex: number) => {
    setEditing(
      (current) =>
        current && {
          ...current,
          questions: current.questions.map((question, i) =>
            i === questionIndex ? { ...question, options: [...question.options, { key: '', text: '' }] } : question,
          ),
        },
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, patch: Partial<QuestionnaireOptionDef>) => {
    setEditing(
      (current) =>
        current && {
          ...current,
          questions: current.questions.map((question, i) =>
            i === questionIndex
              ? {
                  ...question,
                  options: question.options.map((option, oi) => (oi === optionIndex ? { ...option, ...patch } : option)),
                }
              : question,
          ),
        },
    )
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setEditing(
      (current) =>
        current && {
          ...current,
          questions: current.questions.map((question, i) =>
            i === questionIndex
              ? { ...question, options: question.options.filter((_, oi) => oi !== optionIndex) }
              : question,
          ),
        },
    )
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    setError(null)
    try {
      await questionnaireService.saveQuestionnaireTemplate({ kind, definition: JSON.stringify(editing) })
      setEditing(null)
      loadVersions(kind)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-questionnaire-toolbar">
        <div className="seg">
          {KINDS.map((k) => (
            <label key={k} className="seg-opt">
              <input type="radio" checked={kind === k} onChange={() => handleKindChange(k)} />
              {k}
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setEditing(emptyDefinition())}>
          + New template
        </button>
      </div>

      {error && <p className="text-muted admin-empty">{error}</p>}

      {!editing && (status === 'idle' || status === 'loading') && (
        <p className="text-muted admin-empty">Loading versions…</p>
      )}

      {!editing && status === 'ready' && (
        <table className="table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id}>
                <td>v{version.version}</td>
                <td>
                  <span className={version.isActive ? 'tag tag-accent' : 'tag tag-neutral'}>
                    {version.isActive ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="text-muted">{new Date(version.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditing(JSON.parse(version.definition) as QuestionnaireDefinition)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="admin-questionnaire-editor">
          <h5>Categories</h5>
          {editing.sections.map((section, index) => (
            <div key={index} className="admin-editor-row">
              <input
                className="input"
                placeholder="code"
                value={section.code}
                onChange={(e) => updateSection(index, { code: e.target.value })}
              />
              <input
                className="input"
                placeholder="title"
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
              />
              <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeSection(index)}>
                −
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addSection}>
            + Category
          </button>

          <h5>Questions</h5>
          {editing.questions.map((question, qIndex) => (
            <div key={qIndex} className="admin-question-block">
              <div className="admin-editor-row">
                <input
                  className="input"
                  placeholder="key"
                  value={question.key}
                  onChange={(e) => updateQuestion(qIndex, { key: e.target.value })}
                />
                <select
                  className="input"
                  value={question.section}
                  onChange={(e) => updateQuestion(qIndex, { section: e.target.value })}
                >
                  {editing.sections.map((section) => (
                    <option key={section.code} value={section.code}>
                      {section.code}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(qIndex, { type: e.target.value as QuestionnaireQuestionType })
                  }
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeQuestion(qIndex)}>
                  −
                </button>
              </div>
              <input
                className="input"
                placeholder="question text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
              />

              <div className="admin-options-list">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="admin-editor-row">
                    <input
                      className="input"
                      placeholder="option key"
                      value={option.key}
                      onChange={(e) => updateOption(qIndex, oIndex, { key: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="option text"
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => removeOption(qIndex, oIndex)}
                    >
                      −
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost" onClick={() => addOption(qIndex)}>
                  + Option
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>
            + Question
          </button>

          <div className="admin-editor-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save as new version'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQuestionnairePanel
