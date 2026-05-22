import { describe, expect, it } from 'vitest'
import {
  buildChapterDto,
  buildChapterDtoList,
  buildSubjectDto,
  buildSubjectDtoList,
  buildTopicDto,
} from '../factories/content.factory'

describe('content factory', () => {
  describe('buildSubjectDto', () => {
    it('creates a subject with default values', () => {
      const subject = buildSubjectDto()
      expect(subject).toHaveProperty('id')
      expect(subject.name).toBe('Test Subject')
      expect(subject.description).toBe('A test subject description')
      expect(subject.icon_url).toBeNull()
    })

    it('overrides default values', () => {
      const subject = buildSubjectDto({
        name: 'Math',
        icon_url: 'https://example.com/icon.png',
      })
      expect(subject.name).toBe('Math')
      expect(subject.icon_url).toBe('https://example.com/icon.png')
      expect(subject.description).toBe('A test subject description')
    })
  })

  describe('buildSubjectDtoList', () => {
    it('creates the requested number of subjects', () => {
      const subjects = buildSubjectDtoList(3)
      expect(subjects).toHaveLength(3)
    })

    it('assigns unique IDs and names', () => {
      const subjects = buildSubjectDtoList(2)
      expect(subjects[0].id).toBe('subject-1')
      expect(subjects[1].id).toBe('subject-2')
      expect(subjects[0].name).toBe('Subject 1')
      expect(subjects[1].name).toBe('Subject 2')
    })
  })

  describe('buildChapterDto', () => {
    it('creates a chapter linked to a subject', () => {
      const chapter = buildChapterDto({ subject_id: 'subject-1' })
      expect(chapter.subject_id).toBe('subject-1')
      expect(chapter.name).toBe('Test Chapter')
      expect(chapter.order_number).toBe(1)
    })

    it('sets timestamps as Date objects', () => {
      const chapter = buildChapterDto()
      expect(chapter.created_at).toBeInstanceOf(Date)
      expect(chapter.updated_at).toBeInstanceOf(Date)
    })
  })

  describe('buildChapterDtoList', () => {
    it('creates chapters with sequential order numbers', () => {
      const chapters = buildChapterDtoList(3)
      expect(chapters).toHaveLength(3)
      expect(chapters.map((c) => c.order_number)).toEqual([1, 2, 3])
    })

    it('applies overrides to all items', () => {
      const chapters = buildChapterDtoList(2, { subject_id: 'fixed-subject' })
      expect(chapters[0].subject_id).toBe('fixed-subject')
      expect(chapters[1].subject_id).toBe('fixed-subject')
    })
  })

  describe('buildTopicDto', () => {
    it('creates a topic with default values', () => {
      const topic = buildTopicDto()
      expect(topic.name).toBe('Test Topic')
      expect(topic.order_number).toBe(1)
    })

    it('links to a chapter', () => {
      const topic = buildTopicDto({ chapter_id: 'chapter-42' })
      expect(topic.chapter_id).toBe('chapter-42')
    })
  })
})
