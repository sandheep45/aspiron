import {
  buildChapterItem,
  buildChapterItemList,
  buildChapterSummary,
  buildInsightItem,
  buildInsightItemList,
  resetIdCounter,
} from '@mock/factories/chapters-page.factory'
import { describe, expect, it } from 'vitest'

describe('chapters-page factory', () => {
  describe('buildChapterSummary', () => {
    it('creates a default summary', () => {
      const summary = buildChapterSummary()
      expect(summary.subject_name).toBe('Physics')
      expect(summary.total_chapters).toBe(8 as unknown as bigint)
      expect(summary.published_topics).toBe(45 as unknown as bigint)
      expect(summary.draft_topics).toBe(12 as unknown as bigint)
      expect(summary.chapters_needing_attention).toBe(2 as unknown as bigint)
    })

    it('overrides fields', () => {
      const summary = buildChapterSummary({
        subject_name: 'Chemistry',
        total_chapters: 5 as unknown as bigint,
      })
      expect(summary.subject_name).toBe('Chemistry')
      expect(summary.total_chapters).toBe(5 as unknown as bigint)
    })
  })

  describe('buildChapterItem', () => {
    it('creates a default chapter item', () => {
      resetIdCounter()
      const item = buildChapterItem()
      expect(item.id).toBe('chapter-1')
      expect(item.name).toBe('Mechanics')
      expect(item.coverage).toBe(80)
      expect(item.status).toBe('healthy')
    })

    it('overrides fields', () => {
      const item = buildChapterItem({ name: 'Custom', coverage: 50 })
      expect(item.name).toBe('Custom')
      expect(item.coverage).toBe(50)
    })

    it('creates unique IDs per call', () => {
      resetIdCounter()
      const item1 = buildChapterItem()
      const item2 = buildChapterItem()
      expect(item1.id).not.toBe(item2.id)
    })
  })

  describe('buildChapterItemList', () => {
    it('creates the requested number of items', () => {
      const items = buildChapterItemList(3)
      expect(items).toHaveLength(3)
    })

    it('creates items with unique IDs', () => {
      const items = buildChapterItemList(5)
      const ids = new Set(items.map((i) => i.id))
      expect(ids.size).toBe(5)
    })
  })

  describe('buildInsightItem', () => {
    it('creates a default insight item', () => {
      resetIdCounter()
      const item = buildInsightItem()
      expect(item.id).toBe('insight-1')
      expect(item.type).toBeTruthy()
      expect(item.title).toBeTruthy()
      expect(item.description).toBeTruthy()
    })

    it('overrides fields', () => {
      const item = buildInsightItem({
        title: 'Custom Insight',
        type: 'warning',
      })
      expect(item.title).toBe('Custom Insight')
      expect(item.type).toBe('warning')
    })
  })

  describe('buildInsightItemList', () => {
    it('creates the requested number of insights', () => {
      const items = buildInsightItemList(4)
      expect(items).toHaveLength(4)
    })

    it('creates items with valid types', () => {
      const items = buildInsightItemList(4)
      for (const item of items) {
        expect(['positive', 'warning', 'negative', 'info']).toContain(item.type)
      }
    })
  })
})
