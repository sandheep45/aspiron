import { z } from 'zod'

export const createQuestionSchema = z.object({
  question_type: z.string().min(1, 'Question type is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  status: z.string().optional(),
  estimated_time: z.number().min(1).optional(),
  learning_objective: z.string().optional(),
  question_text: z.string().optional(),
  explanation: z.string().optional(),
  common_mistakes: z.string().optional(),
  hints: z.string().optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  choices_a: z.string().optional(),
  choices_b: z.string().optional(),
  choices_c: z.string().optional(),
  choices_d: z.string().optional(),
  tolerance: z.string().optional(),
  unit: z.string().optional(),
  rubric: z.string().optional(),
  evaluation_criteria: z.string().optional(),
  assertion_reason_assertion: z.string().optional(),
  assertion_reason_reason: z.string().optional(),
  multiple_select_answers: z.string().optional(),
})

export type CreateQuestionSchema = typeof createQuestionSchema
