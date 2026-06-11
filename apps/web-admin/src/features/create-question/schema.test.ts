import { describe, expect, it } from 'vitest'
import { createQuestionSchema } from '@/features/create-question/schema'

describe('createQuestionSchema', () => {
  it('validates a valid MCQ form', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'MCQ',
      difficulty: 'Medium',
      correct_answer: 'Option A',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty question_type', () => {
    const result = createQuestionSchema.safeParse({
      question_type: '',
      difficulty: 'Easy',
      correct_answer: 'A',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('question_type')
    }
  })

  it('rejects empty difficulty', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'MCQ',
      difficulty: '',
      correct_answer: 'A',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('difficulty')
    }
  })

  it('rejects empty correct_answer', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'MCQ',
      difficulty: 'Easy',
      correct_answer: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('correct_answer')
    }
  })

  it('accepts optional fields', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'Numerical',
      difficulty: 'Hard',
      correct_answer: '42',
      tolerance: '0.5',
      unit: 'cm',
      estimated_time: 10,
      learning_objective: 'Understand calculus',
      status: 'Draft',
      rubric: 'Full marks for correct answer',
      evaluation_criteria: 'Partial credit for method',
    })
    expect(result.success).toBe(true)
  })

  it('accepts assertion reason fields', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'Assertion Reason',
      difficulty: 'Hard',
      correct_answer: 'Both are true',
      assertion_reason_assertion: 'Statement is true',
      assertion_reason_reason: 'Because...',
    })
    expect(result.success).toBe(true)
  })

  it('accepts subjective fields', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'Subjective',
      difficulty: 'Medium',
      correct_answer: 'Model answer',
      rubric: 'Grading guide',
      evaluation_criteria: 'Criteria list',
    })
    expect(result.success).toBe(true)
  })

  it('accepts multiple select fields', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'Multiple Select',
      difficulty: 'Medium',
      correct_answer: 'A, B, C',
      choices_a: 'Option A',
      choices_b: 'Option B',
      choices_c: 'Option C',
      choices_d: 'Option D',
      multiple_select_answers: 'A, B',
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative estimated_time', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'MCQ',
      difficulty: 'Easy',
      correct_answer: 'A',
      estimated_time: -5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('estimated_time')
    }
  })

  it('rejects estimated_time of 0 (min is 1)', () => {
    const result = createQuestionSchema.safeParse({
      question_type: 'MCQ',
      difficulty: 'Easy',
      correct_answer: 'A',
      estimated_time: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const result = createQuestionSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('question_type')
      expect(paths).toContain('difficulty')
      expect(paths).toContain('correct_answer')
    }
  })
})
