/**
 * Query key definitions for consistent caching
 */

export const queryKeys = {
  // Authentication
  auth: {
    currentUser: () => ['auth', 'currentUser'] as const,
  },

  admin: {
    insights: () => ['insights'] as const,
    lists: () => [...queryKeys.admin.insights(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.admin.lists(), { page, limit }] as const,
    topicPerformance: () => ['topicPerformance'] as const,
    painPointsCritical: () => ['painPoints', 'critical'] as const,
    painPoints: () => ['painPoints'] as const,
    painPointsInsights: () => ['painPoints', 'insights'] as const,
    painPointsTopicDetail: (id: string) =>
      ['painPoints', 'detail', id] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    lists: () => [...queryKeys.users.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.users.lists(), { page, limit }] as const,
    details: () => [...queryKeys.users.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  contents: {
    topics: {
      getTopicById: (topicId: string) => ['getTopicById', topicId],
    },
  },

  // Topics Page
  topicsPage: {
    all: () => ['topicsPage'] as const,
    chapter: (chapterId: string) =>
      [...queryKeys.topicsPage.all(), 'chapter', chapterId] as const,
    topics: (chapterId: string, params?: Record<string, unknown>) =>
      [
        ...queryKeys.topicsPage.all(),
        'topics',
        chapterId,
        ...(params ? [params] : []),
      ] as const,
    insights: (chapterId: string) =>
      [...queryKeys.topicsPage.all(), 'insights', chapterId] as const,
  },

  // Chapters Page
  chaptersPage: {
    all: () => ['chaptersPage'] as const,
    subject: (subjectId: string) =>
      [...queryKeys.chaptersPage.all(), 'subject', subjectId] as const,
    chapters: (subjectId: string, params?: Record<string, unknown>) =>
      [
        ...queryKeys.chaptersPage.all(),
        'chapters',
        subjectId,
        ...(params ? [params] : []),
      ] as const,
    insights: (subjectId: string) =>
      [...queryKeys.chaptersPage.all(), 'insights', subjectId] as const,
  },

  // Subjects Page
  subjectsPage: {
    all: () => ['subjectsPage'] as const,
    subjects: () => [...queryKeys.subjectsPage.all(), 'subjects'] as const,
    summary: () => [...queryKeys.subjectsPage.all(), 'summary'] as const,
    signals: () => [...queryKeys.subjectsPage.all(), 'signals'] as const,
  },

  // Content Dashboard
  contentDashboard: {
    summary: () => ['contentDashboard', 'summary'] as const,
    attention: (params?: Record<string, unknown>) =>
      ['contentDashboard', 'attention', ...(params ? [params] : [])] as const,
    subjects: () => ['contentDashboard', 'subjects'] as const,
    signals: () => ['contentDashboard', 'signals'] as const,
  },

  // Courses
  courses: {
    all: () => ['courses'] as const,
    lists: () => [...queryKeys.courses.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.courses.lists(), { page, limit }] as const,
    details: () => [...queryKeys.courses.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
  },

  // Live classes
  liveClass: {
    all: () => ['liveClass'] as const,
    lists: () => [...queryKeys.liveClass.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.liveClass.lists(), { page, limit }] as const,
  },

  // Topic Detail
  topicDetail: {
    all: () => ['topicDetail'] as const,
    overview: (topicId: string) =>
      [...queryKeys.topicDetail.all(), 'overview', topicId] as const,
    issues: (topicId: string) =>
      [...queryKeys.topicDetail.all(), 'issues', topicId] as const,
    components: (topicId: string) =>
      [...queryKeys.topicDetail.all(), 'components', topicId] as const,
    actions: (topicId: string) =>
      [...queryKeys.topicDetail.all(), 'actions', topicId] as const,
    trends: (topicId: string) =>
      [...queryKeys.topicDetail.all(), 'trends', topicId] as const,
  },

  // Assignments
  assignments: {
    all: () => ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all(), 'list'] as const,
    list: (courseId: string, page: number, limit: number) =>
      [...queryKeys.assignments.lists(), courseId, { page, limit }] as const,
    details: () => [...queryKeys.assignments.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    submissions: (assignmentId: string) =>
      [
        ...queryKeys.assignments.details(),
        assignmentId,
        'submissions',
      ] as const,
  },
} as const
