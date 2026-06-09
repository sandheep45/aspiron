import {
  buildInsightItem,
  buildInsightItemList,
  buildTopicItem,
  buildTopicItemList,
  buildTopicSummary,
  resetIdCounter,
} from '@mock/factories/topics-page.factory'
import { describe, expect, it } from 'vitest'

describe('topics-page factory', () => {
  describe('buildTopicSummary', () => {
    it('creates a default summary', () => {
      const summary = buildTopicSummary()
      expect(summary.chapter_name).toBe('Electrostatics')
      expect(summary.total_topics).toBe(8 as unknown as bigint)
      expect(summary.published_topics).toBe(6 as unknown as bigint)
      expect(summary.draft_topics).toBe(2 as unknown as bigint)
      expect(summary.weak_topics).toBe(2 as unknown as bigint)
    })

    it('overrides fields', () => {
      const summary = buildTopicSummary({
        chapter_name: 'Optics',
        total_topics: 5 as unknown as bigint,
      })
      expect(summary.chapter_name).toBe('Optics')
      expect(summary.total_topics).toBe(5 as unknown as bigint)
    })
  })

  describe('buildTopicItem', () => {
    it('creates a default topic item', () => {
      resetIdCounter()
      const item = buildTopicItem()
      expect(item.id).toBe('topic-1')
      expect(item.name).toBe('Topic topic-1')
      expect(item.content_status).toBe('published')
      expect(item.video_available).toBe(true)
      expect(item.recall_strength).toBe('medium')
      expect(item.practice_accuracy).toBe(65)
      expect(item.status).toBe('needs_attention')
    })

    it('overrides fields', () => {
      const item = buildTopicItem({
        name: 'Custom Topic',
        content_status: 'draft',
      })
      expect(item.name).toBe('Custom Topic')
      expect(item.content_status).toBe('draft')
    })

    it('creates unique IDs per call', () => {
      resetIdCounter()
      const item1 = buildTopicItem()
      const item2 = buildTopicItem()
      expect(item1.id).not.toBe(item2.id)
    })
  })

  describe('buildTopicItemList', () => {
    it('creates the requested number of items', () => {
      const items = buildTopicItemList(3)
      expect(items).toHaveLength(3)
    })

    it('creates items with unique IDs', () => {
      const items = buildTopicItemList(5)
      const ids = new Set(items.map((i) => i.id))
      expect(ids.size).toBe(5)
    })

    it('applies overrides to all items', () => {
      const items = buildTopicItemList(3, { status: 'critical' })
      for (const item of items) {
        expect(item.status).toBe('critical')
      }
    })
  })

  describe('buildInsightItem', () => {
    it('creates a default insight item', () => {
      resetIdCounter()
      const item = buildInsightItem()
      expect(item.type).toBe('info')
      expect(item.title).toBe('Sample insight')
      expect(item.description).toBe(
        'This is a sample insight description for testing purposes.',
      )
    })

    it('overrides fields', () => {
      const item = buildInsightItem({ title: 'Custom', type: 'warning' })
      expect(item.title).toBe('Custom')
      expect(item.type).toBe('warning')
    })
  })

  describe('buildInsightItemList', () => {
    it('creates the requested number of insights', () => {
      const items = buildInsightItemList(4)
      expect(items).toHaveLength(4)
    })

    it('creates items with cycling types', () => {
      const items = buildInsightItemList(4)
      expect(items[0].type).toBe('positive')
      expect(items[1].type).toBe('warning')
      expect(items[2].type).toBe('negative')
      expect(items[3].type).toBe('info')
    })
  })
})
