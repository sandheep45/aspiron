import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildFreeRecallResponse,
  buildMcqRecallResponse,
  buildMemoryGapMapResponse,
  buildRecallOverview,
  buildRecallTrendsResponse,
  buildSuggestedActionItem,
  buildSuggestedActionsResponse,
  buildTrendDataPoint,
  resetIdCounter,
} from './recall-insights.factory'

describe('recall insights factory', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  describe('buildRecallOverview', () => {
    it('creates overview with default values', () => {
      const result = buildRecallOverview()
      expect(result.avg_recall_score).toBe(72.5)
      expect(result.completion_rate).toBe(85.0)
      expect(result.memory_decay).toBe('stable')
      expect(result.last_recall_run).toBe('2 hours ago')
    })

    it('overrides default values', () => {
      const result = buildRecallOverview({ avg_recall_score: 90.0 })
      expect(result.avg_recall_score).toBe(90.0)
      expect(result.completion_rate).toBe(85.0)
    })
  })

  describe('buildMcqRecallResponse', () => {
    it('creates MCQ response with default values', () => {
      const result = buildMcqRecallResponse()
      expect(result.overall_accuracy).toBe(72.5)
      expect(result.difficulty_breakdown).toHaveLength(3)
      expect(result.questions).toHaveLength(2)
    })

    it('overrides fields', () => {
      const result = buildMcqRecallResponse({ overall_accuracy: 50.0 })
      expect(result.overall_accuracy).toBe(50.0)
    })
  })

  describe('buildFreeRecallResponse', () => {
    it('creates free recall response with default values', () => {
      const result = buildFreeRecallResponse()
      expect(result.participation_rate).toBe(60.0)
      expect(result.ai_clarity_score).toBe(72.5)
      expect(result.missing_concepts).toHaveLength(3)
    })
  })

  describe('buildMemoryGapMapResponse', () => {
    it('creates memory gap map with default items', () => {
      const result = buildMemoryGapMapResponse()
      expect(result.items).toHaveLength(3)
      expect(result.items[0].recall_status).toBe('remembered')
      expect(result.items[1].recall_status).toBe('partial')
      expect(result.items[2].recall_status).toBe('forgotten')
    })

    it('includes mismatch alert on forgotten item', () => {
      const result = buildMemoryGapMapResponse()
      expect(result.items[2].mismatch_alert).toBe(
        'High Confidence, Low Accuracy',
      )
    })

    it('overrides items', () => {
      const result = buildMemoryGapMapResponse({ items: [] })
      expect(result.items).toHaveLength(0)
    })
  })

  describe('buildSuggestedActionItem', () => {
    it('creates action item with default values', () => {
      const item = buildSuggestedActionItem()
      expect(item.id).toBeTruthy()
      expect(item.detected_issue).toBeTruthy()
      expect(item.primary_cta).toBe('Review Video')
    })

    it('generates unique IDs', () => {
      const a = buildSuggestedActionItem()
      const b = buildSuggestedActionItem()
      expect(a.id).not.toBe(b.id)
    })
  })

  describe('buildSuggestedActionsResponse', () => {
    it('returns 4 default action items', () => {
      const items = buildSuggestedActionsResponse()
      expect(items).toHaveLength(4)
    })

    it('returns custom override when provided', () => {
      const custom = [buildSuggestedActionItem({ id: 'custom-1' })]
      const items = buildSuggestedActionsResponse(custom)
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('custom-1')
    })
  })

  describe('buildTrendDataPoint', () => {
    it('creates data point with default values', () => {
      const point = buildTrendDataPoint()
      expect(point.date).toBe('2026-01-15')
      expect(point.value).toBe(72.5)
    })

    it('overrides fields', () => {
      const point = buildTrendDataPoint({ value: 95.0 })
      expect(point.value).toBe(95.0)
    })
  })

  describe('buildRecallTrendsResponse', () => {
    it('creates trends response with all 4 arrays', () => {
      const result = buildRecallTrendsResponse()
      expect(result.recall_trend).toHaveLength(3)
      expect(result.memory_decay_curve).toHaveLength(3)
      expect(result.recall_by_difficulty).toHaveLength(2)
      expect(result.retention_distribution).toHaveLength(1)
    })

    it('overrides fields', () => {
      const result = buildRecallTrendsResponse({ recall_trend: [] })
      expect(result.recall_trend).toHaveLength(0)
    })
  })
})
