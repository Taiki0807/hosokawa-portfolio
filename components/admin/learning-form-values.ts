import type { LearningFormValues } from './LearningForm'

export function newFormValues(date: string): LearningFormValues {
  return {
    date,
    title: '',
    status: 'draft',
    sessions: [{ tag: '', minutes: '', memo: '' }],
    noteMd: '',
    reportText: '',
    reportAiPolished: false,
  }
}
