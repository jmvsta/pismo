import type {
  QuestionnaireAnswers,
  QuestionnaireAnswerValue,
  QuestionnaireDefinition,
  QuestionnaireQuestionDef,
} from '../../store/questionnaireDefinition.ts'

interface ProfileQuestionnaireAnswersProps {
  definition: QuestionnaireDefinition | null
  answers: QuestionnaireAnswers
  hasSubmitted: boolean
}

function describeAnswer(question: QuestionnaireQuestionDef, value: QuestionnaireAnswerValue | undefined): string {
  if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return 'Not answered'
  }
  const keys = Array.isArray(value) ? value : [value]
  return keys.map((key) => question.options.find((option) => option.key === key)?.text ?? key).join(', ')
}

function ProfileQuestionnaireAnswers({ definition, answers, hasSubmitted }: ProfileQuestionnaireAnswersProps) {
  if (!definition) {
    return <p className="text-muted profile-empty">Could not load the questionnaire.</p>
  }

  if (!hasSubmitted) {
    return <p className="text-muted profile-empty">You haven't completed the questionnaire yet.</p>
  }

  return (
    <div className="profile-questionnaire-answers">
      {definition.questions.map((question) => (
        <div key={question.key} className="profile-questionnaire-answer">
          <div className="profile-questionnaire-question">{question.text}</div>
          <div className="text-muted">{describeAnswer(question, answers[question.key])}</div>
        </div>
      ))}
    </div>
  )
}

export default ProfileQuestionnaireAnswers
