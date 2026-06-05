import { describe, expect, it } from 'vitest'
import {
  buildContentDashboardAttentionItem,
  buildContentDashboardAttentionResponse,
  buildContentDashboardSignalItem,
  buildContentDashboardSignalsResponse,
  buildContentDashboardSubjectProgress,
  buildContentDashboardSubjectsResponse,
  buildContentDashboardSummary,
} from './content-dashboard.factory'

describe('content dashboard factory', () => {
  describe('buildContentDashboardSummary', () => {
    it('creates summary with default values', () => {
      const result = buildContentDashboardSummary()
      expect(result.subjects_covered).toBe(3)
      expect(result.topics_published).toBe(147)
      expect(result.topics_in_draft).toBe(23)
      expect(result.topics_flagged).toBe(12)
    })

    it('overrides default values', () => {
      const result = buildContentDashboardSummary({ subjects_covered: 5 })
      expect(result.subjects_covered).toBe(5)
      expect(result.topics_published).toBe(147)
    })
  })

  describe('buildContentDashboardAttentionItem', () => {
    it('creates an attention item with default values', () => {
      const item = buildContentDashboardAttentionItem()
      expect(item.id).toBeTruthy()
      expect(item.topic).toBeTruthy()
      expect(item.issue).toBeTruthy()
      expect(item.students_affected).toBeGreaterThanOrEqual(0)
    })

    it('overrides fields', () => {
      const item = buildContentDashboardAttentionItem({ topic: 'Test Topic' })
      expect(item.topic).toBe('Test Topic')
    })
  })

  describe('buildContentDashboardAttentionResponse', () => {
    it('creates response with requested count', () => {
      const response = buildContentDashboardAttentionResponse(3)
      expect(response.items).toHaveLength(3)
    })

    it('creates response with default count', () => {
      const response = buildContentDashboardAttentionResponse()
      expect(response.items).toHaveLength(4)
    })
  })

  describe('buildContentDashboardSubjectProgress', () => {
    it('creates subject progress with defaults', () => {
      const subject = buildContentDashboardSubjectProgress()
      expect(subject.name).toBe('Physics')
      expect(subject.completion).toBe(87)
    })

    it('overrides fields', () => {
      const subject = buildContentDashboardSubjectProgress({ name: 'Math' })
      expect(subject.name).toBe('Math')
    })
  })

  describe('buildContentDashboardSubjectsResponse', () => {
    it('creates requested number of subjects', () => {
      const subjects = buildContentDashboardSubjectsResponse(3)
      expect(subjects).toHaveLength(3)
    })
  })

  describe('buildContentDashboardSignalItem', () => {
    it('creates signal item with defaults', () => {
      const item = buildContentDashboardSignalItem()
      expect(item.topic).toBeTruthy()
    })

    it('overrides score and drop', () => {
      const item = buildContentDashboardSignalItem({
        score: 84,
        drop: null as unknown as undefined,
      })
      expect(item.score).toBe(84)
    })
  })

  describe('buildContentDashboardSignalsResponse', () => {
    it('creates both highest_recall and fastest_decay arrays', () => {
      const response = buildContentDashboardSignalsResponse()
      expect(response.highest_recall).toHaveLength(3)
      expect(response.fastest_decay).toHaveLength(3)
    })
  })
})
