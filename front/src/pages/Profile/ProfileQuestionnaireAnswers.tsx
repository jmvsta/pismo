import { useMemo, useState, type ReactNode } from 'react'
import type {
  QuestionnaireAnswers,
  QuestionnaireAnswerValue,
  QuestionnaireDefinition,
  QuestionnaireQuestionDef,
  QuestionnaireSectionDef,
} from '../../store/questionnaireDefinition.ts'

interface ProfileQuestionnaireAnswersProps {
  definition: QuestionnaireDefinition | null
  answers: QuestionnaireAnswers
  hasSubmitted: boolean
  title?: string
  action?: ReactNode
}

function describeAnswer(question: QuestionnaireQuestionDef, value: QuestionnaireAnswerValue | undefined): string {
  if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return 'Not answered'
  }
  const keys = Array.isArray(value) ? value : [value]
  return keys.map((key) => question.options.find((option) => option.key === key)?.text ?? key).join(', ')
}

function isAnswered(value: QuestionnaireAnswerValue | undefined): boolean {
  return value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
}

interface Category {
  section: QuestionnaireSectionDef
  questions: QuestionnaireQuestionDef[]
}

function groupBySection(definition: QuestionnaireDefinition): Category[] {
  return definition.sections
    .map((section) => ({
      section,
      questions: definition.questions.filter((question) => question.section === section.code),
    }))
    .filter((category) => category.questions.length > 0)
}

function QuestionRow({ question, answers }: { question: QuestionnaireQuestionDef; answers: QuestionnaireAnswers }) {
  const [open, setOpen] = useState(false)
  const answered = isAnswered(answers[question.key])

  return (
    <div className="border-b border-[var(--color-divider)] last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-2 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="font-semibold">{question.text}</span>
        <span className="text-muted shrink-0 text-sm">
          {answered ? (open ? '▲' : '▼') : 'Not answered'}
        </span>
      </button>
      {open && <div className="text-muted pb-2">{describeAnswer(question, answers[question.key])}</div>}
    </div>
  )
}

function CategorySection({ category, answers }: { category: Category; answers: QuestionnaireAnswers }) {
  const [open, setOpen] = useState(false)
  const answeredCount = category.questions.filter((question) => isAnswered(answers[question.key])).length

  return (
    <div className="border border-[var(--color-divider)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 bg-[var(--color-surface)] px-3 py-2 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="font-semibold">{category.section.title}</span>
        <span className="text-muted text-sm">
          {answeredCount}/{category.questions.length} · {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="px-3">
          {category.questions.map((question) => (
            <QuestionRow key={question.key} question={question} answers={answers} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileQuestionnaireAnswers({ definition, answers, hasSubmitted, title, action }: ProfileQuestionnaireAnswersProps) {
  const categories = useMemo(() => (definition ? groupBySection(definition) : []), [definition])

  if (!definition) {
    return <p className="text-muted profile-empty">Could not load the questionnaire.</p>
  }

  if (!hasSubmitted) {
    return (
      <div className="flex flex-col items-start gap-2">
        {title && <h6>{title}</h6>}
        <p className="text-muted profile-empty">You haven't completed this questionnaire yet.</p>
        {action}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h6>{title}</h6>}
          {action}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <CategorySection key={category.section.code} category={category} answers={answers} />
        ))}
      </div>
    </div>
  )
}

export default ProfileQuestionnaireAnswers
