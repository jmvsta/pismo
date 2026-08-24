import type { QuestionnaireAnswerValue, QuestionnaireQuestionDef } from '../../store/questionnaireDefinition.ts'

interface QuestionProps {
  question: QuestionnaireQuestionDef
  value: QuestionnaireAnswerValue | undefined
  onChange: (value: QuestionnaireAnswerValue) => void
}

function toggleInList(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((item) => item !== key) : [...list, key]
}

function MultiChoiceOptions({ question, value, onChange }: QuestionProps) {
  const selected = Array.isArray(value) ? value : []

  return (
    <div className="questionnaire-tags">
      {question.options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`tag tag-select ${selected.includes(option.key) ? 'tag-accent' : 'tag-neutral'}`}
          onClick={() => onChange(toggleInList(selected, option.key))}
        >
          {option.text}
        </button>
      ))}
    </div>
  )
}

function PhotoChoiceOptions({ question, value, onChange }: QuestionProps) {
  const selected = typeof value === 'string' ? value : undefined

  return (
    <div className="questionnaire-photos">
      {question.options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`photo-placeholder questionnaire-photo ${selected === option.key ? 'is-selected' : ''}`}
          onClick={() => onChange(option.key)}
        >
          {option.photo_url ? <img src={option.photo_url} alt={option.text} /> : <span>{option.text}</span>}
        </button>
      ))}
    </div>
  )
}

function SingleChoiceOptions({ question, value, onChange }: QuestionProps) {
  const selected = typeof value === 'string' ? value : undefined
  const selectedOption = question.options.find((option) => option.key === selected)
  const freeTextOption = question.options.find((option) => option.free_text)
  const isFreeTextSelected = selected !== undefined && !selectedOption && Boolean(freeTextOption)

  return (
    <div className="questionnaire-radio-list">
      {question.options.map((option) => (
        <label className="radio" key={option.key}>
          <input
            type="radio"
            name={question.key}
            checked={option.free_text ? isFreeTextSelected : selected === option.key}
            onChange={() => onChange(option.free_text ? '' : option.key)}
          />
          <span className="dot" />
          {option.text}
        </label>
      ))}
      {isFreeTextSelected && (
        <input
          className="input"
          value={selected ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us more"
        />
      )}
    </div>
  )
}

function QuestionnaireQuestion({ question, value, onChange }: QuestionProps) {
  return (
    <div className="questionnaire-question">
      <div className="questionnaire-question-title">{question.text}</div>
      {question.type === 'multi' ? (
        <MultiChoiceOptions question={question} value={value} onChange={onChange} />
      ) : question.display === 'photo' ? (
        <PhotoChoiceOptions question={question} value={value} onChange={onChange} />
      ) : (
        <SingleChoiceOptions question={question} value={value} onChange={onChange} />
      )}
    </div>
  )
}

export default QuestionnaireQuestion
