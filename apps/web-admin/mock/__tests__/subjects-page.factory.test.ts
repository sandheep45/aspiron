import { describe, expect, it } from 'vitest'
import {
  buildSubjectPageItem,
  buildSubjectPageItemsResponse,
  buildSubjectSignal,
  buildSubjectSignalsResponse,
  buildSubjectSummary,
} from '../factories/subjects-page.factory'

describe('subjects page factory', () => {
  describe('buildSubjectPageItem', () => {
    it('creates with default values', () => {
      const item = buildSubjectPageItem()
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('chapters_count')
      expect(item).toHaveProperty('topics_published')
      expect(item).toHaveProperty('coverage')
      expect(item).toHaveProperty('average_recall')
      expect(item).toHaveProperty('practice_accuracy')
      expect(item).toHaveProperty('status')
    })

    it('overrides values', () => {
      const item = buildSubjectPageItem({ name: 'Test Subject', coverage: 50 })
      expect(item.name).toBe('Test Subject')
      expect(item.coverage).toBe(50)
    })
  })

  describe('buildSubjectPageItemsResponse', () => {
    it('creates requested count', () => {
      const items = buildSubjectPageItemsResponse(3)
      expect(items).toHaveLength(3)
    })
  })

  describe('buildSubjectSummary', () => {
    it('creates with all fields', () => {
      const summary = buildSubjectSummary()
      expect(summary).toHaveProperty('total_subjects')
      expect(summary).toHaveProperty('total_topics')
      expect(summary).toHaveProperty('published_topics')
      expect(summary).toHaveProperty('topics_needing_attention')
      expect(summary.descriptions).toHaveLength(4)
    })

    it('overrides values', () => {
      const summary = buildSubjectSummary({ total_subjects: 10 })
      expect(summary.total_subjects).toBe(10)
    })
  })

  describe('buildSubjectSignal', () => {
    it('creates with defaults', () => {
      const signal = buildSubjectSignal()
      expect(signal).toHaveProperty('subject_name')
      expect(signal).toHaveProperty('message')
      expect(signal.signal_type).toMatch(/^(positive|negative)$/)
    })

    it('overrides signal_type', () => {
      const signal = buildSubjectSignal({ signal_type: 'negative' as const })
      expect(signal.signal_type).toBe('negative')
    })
  })

  describe('buildSubjectSignalsResponse', () => {
    it('creates requested count', () => {
      const signals = buildSubjectSignalsResponse(2)
      expect(signals).toHaveLength(2)
    })
  })
})
