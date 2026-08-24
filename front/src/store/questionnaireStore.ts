import { create } from 'zustand'
import { questionnaireService } from '../services/questionnaire/index.ts'
import type {
  QuestionnaireKind,
  QuestionnaireVersionSummary,
} from '../services/questionnaire/index.ts'
import type {
  QuestionnaireAnswers,
  QuestionnaireAnswerValue,
  QuestionnaireDefinition,
} from './questionnaireDefinition.ts'

type QuestionnaireStatus = 'idle' | 'loading' | 'ready' | 'error'

interface QuestionnaireState {
  version: QuestionnaireVersionSummary | null
  definition: QuestionnaireDefinition | null
  answers: QuestionnaireAnswers
  responseId: string | null
  status: QuestionnaireStatus
  error: string | null
  load: (kind: QuestionnaireKind) => Promise<void>
  setAnswer: (questionKey: string, value: QuestionnaireAnswerValue) => void
  save: () => Promise<void>
  submit: () => Promise<void>
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong loading the questionnaire.'
}

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  version: null,
  definition: null,
  answers: {},
  responseId: null,
  status: 'idle',
  error: null,

  load: async (kind) => {
    set({ status: 'loading', error: null })
    try {
      const activeVersion = await questionnaireService.activeQuestionnaire(kind)
      if (!activeVersion) {
        set({ status: 'error', error: 'No active questionnaire is published yet.' })
        return
      }

      const { definition: rawDefinition, ...version } = activeVersion
      const definition = JSON.parse(rawDefinition) as QuestionnaireDefinition
      const existingResponse = await questionnaireService.myQuestionnaireResponse(version.id)

      set({
        version,
        definition,
        answers: existingResponse
          ? (JSON.parse(existingResponse.answers) as QuestionnaireAnswers)
          : {},
        responseId: existingResponse?.id ?? null,
        status: 'ready',
      })
    } catch (error) {
      set({ status: 'error', error: toErrorMessage(error) })
    }
  },

  setAnswer: (questionKey, value) => {
    set((state) => ({ answers: { ...state.answers, [questionKey]: value } }))
  },

  save: async () => {
    const { version, answers } = get()
    if (!version) return
    const response = await questionnaireService.saveQuestionnaireResponse({
      questionnaireVersionId: version.id,
      answers: JSON.stringify(answers),
    })
    set({ responseId: response.id })
  },

  submit: async () => {
    const { responseId } = get()
    if (!responseId) return
    await questionnaireService.submitQuestionnaireResponse(responseId)
  },
}))
