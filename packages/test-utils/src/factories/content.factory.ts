import type {
  ChapterDto,
  ChaptersResponse,
  SubjectDto,
  TopicDto,
  TopicsResponse,
  VideoDto,
  VideosResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildSubjectDto = (
  overrides?: Partial<SubjectDto>,
): SubjectDto => ({
  id: nextId('subject'),
  name: 'Test Subject',
  description: 'A test subject description',
  icon_url: null,
  ...overrides,
})

export const buildSubjectDtoList = (
  count: number,
  overrides?: Partial<SubjectDto>,
): SubjectDto[] =>
  Array.from({ length: count }, (_, i) =>
    buildSubjectDto({
      id: `subject-${i + 1}`,
      name: `Subject ${i + 1}`,
      ...overrides,
    }),
  )

export const buildChapterDto = (
  overrides?: Partial<ChapterDto>,
): ChapterDto => ({
  id: nextId('chapter'),
  name: 'Test Chapter',
  subject_id: nextId('subject'),
  order_number: 1,
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

export const buildChapterDtoList = (
  count: number,
  overrides?: Partial<ChapterDto>,
): ChapterDto[] =>
  Array.from({ length: count }, (_, i) =>
    buildChapterDto({
      id: `chapter-${i + 1}`,
      name: `Chapter ${i + 1}`,
      order_number: i + 1,
      ...overrides,
    }),
  )

export const buildTopicDto = (overrides?: Partial<TopicDto>): TopicDto => ({
  id: nextId('topic'),
  name: 'Test Topic',
  chapter_id: nextId('chapter'),
  order_number: 1,
  ...overrides,
})

export const buildTopicDtoList = (
  count: number,
  overrides?: Partial<TopicDto>,
): TopicDto[] =>
  Array.from({ length: count }, (_, i) =>
    buildTopicDto({
      id: `topic-${i + 1}`,
      name: `Topic ${i + 1}`,
      order_number: i + 1,
      ...overrides,
    }),
  )

export const buildTopicsResponse = (
  overrides?: Partial<TopicsResponse>,
): TopicsResponse => ({
  topics: buildTopicDtoList(3),
  pagination: null,
  ...overrides,
})

export const buildVideoDto = (overrides?: Partial<VideoDto>): VideoDto => ({
  id: nextId('video'),
  topic_id: nextId('topic'),
  title: 'Test Video',
  duration_seconds: 600,
  video_url: 'https://storage.example.com/videos/test.mp4',
  transcript: null,
  ...overrides,
})

export const buildVideoDtoList = (
  count: number,
  overrides?: Partial<VideoDto>,
): VideoDto[] =>
  Array.from({ length: count }, (_, i) =>
    buildVideoDto({
      id: `video-${i + 1}`,
      title: `Video ${i + 1}`,
      ...overrides,
    }),
  )

export const buildVideosResponse = (
  overrides?: Partial<VideosResponse>,
): VideosResponse => ({
  videos: buildVideoDtoList(3),
  pagination: null,
  ...overrides,
})

export const buildChaptersResponse = (
  overrides?: Partial<ChaptersResponse>,
): ChaptersResponse => ({
  chapters: buildChapterDtoList(3),
  pagination: null,
  ...overrides,
})
