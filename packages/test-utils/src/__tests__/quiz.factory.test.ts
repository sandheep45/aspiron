import { describe, expect, it } from 'vitest'
import {
  buildAttemptResponse,
  buildAttemptResultResponse,
  buildQuestionResponse,
  buildQuestionResponseList,
  buildQuizResponse,
  buildQuizResponseList,
} from '../factories/quiz.factory'

describe('quiz factory', () => {
  describe('buildQuizResponse', () => {
    it('creates a quiz with default values', () => {
      const quiz = buildQuizResponse()
      expect(quiz.title).toBe('Test Quiz')
      expect(quiz.description).toBe('A test quiz description')
      expect(quiz.time_limit_minutes).toBe(30)
      expect(quiz.passing_score).toBe(70)
    })

    it('overrides default values', () => {
      const quiz = buildQuizResponse({ title: 'Final Exam', passing_score: 80 })
      expect(quiz.title).toBe('Final Exam')
      expect(quiz.passing_score).toBe(80)
      expect(quiz.time_limit_minutes).toBe(30)
    })
  })

  describe('buildQuizResponseList', () => {
    it('creates the requested number of quizzes', () => {
      const quizzes = buildQuizResponseList(3)
      expect(quizzes).toHaveLength(3)
    })

    it('assigns unique IDs and titles', () => {
      const quizzes = buildQuizResponseList(2)
      expect(quizzes[0].id).toBe('quiz-1')
      expect(quizzes[1].id).toBe('quiz-2')
      expect(quizzes[0].title).toBe('Quiz 1')
      expect(quizzes[1].title).toBe('Quiz 2')
    })
  })

  describe('buildQuestionResponse', () => {
    it('creates a question with default values', () => {
      const question = buildQuestionResponse()
      expect(question.question_text).toBe('What is the capital of France?')
      expect(question.question_type).toBe('multiple_choice')
    })

    it('links to a quiz', () => {
      const question = buildQuestionResponse({ quiz_id: 'quiz-42' })
      expect(question.quiz_id).toBe('quiz-42')
    })
  })

  describe('buildQuestionResponseList', () => {
    it('creates questions with unique IDs', () => {
      const questions = buildQuestionResponseList(3)
      expect(questions).toHaveLength(3)
      expect(questions[0].id).toBe('question-1')
      expect(questions[2].id).toBe('question-3')
    })
  })

  describe('buildAttemptResponse', () => {
    it('creates an attempt with default status', () => {
      const attempt = buildAttemptResponse()
      expect(attempt.status).toBe('in_progress')
    })

    it('overrides status', () => {
      const attempt = buildAttemptResponse({ status: 'completed' })
      expect(attempt.status).toBe('completed')
    })
  })

  describe('buildAttemptResultResponse', () => {
    it('creates a passing result by default', () => {
      const result = buildAttemptResultResponse()
      expect(result.passed).toBe(true)
      expect(result.score_percent).toBe(70)
    })

    it('overrides results', () => {
      const result = buildAttemptResultResponse({
        passed: false,
        score_percent: 40,
        correct_answers: 4,
      })
      expect(result.passed).toBe(false)
      expect(result.score_percent).toBe(40)
      expect(result.correct_answers).toBe(4)
    })
  })
})
