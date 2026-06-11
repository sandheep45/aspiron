import { formOptions } from '@tanstack/react-form-start'
import { createQuestionSchema } from '@/features/create-question/schema'

export const createQuestionFormOption = formOptions({
  validators: {
    onChange: createQuestionSchema,
  },
  defaultValues: {
    question_type: 'MCQ',
    difficulty: 'Medium',
    status: 'Draft',
    estimated_time: 5,
    learning_objective: '',
    question_text: '',
    explanation: '',
    common_mistakes: '',
    hints: '',
    correct_answer: '',
    choices_a: '',
    choices_b: '',
    choices_c: '',
    choices_d: '',
    tolerance: '',
    unit: '',
    rubric: '',
    evaluation_criteria: '',
    assertion_reason_assertion: '',
    assertion_reason_reason: '',
    multiple_select_answers: '',
  },
})
