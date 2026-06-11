export const queryKeys = {
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
  subjectsPage: {
    all: () => ['subjectsPage'] as const,
    subjects: () => [...queryKeys.subjectsPage.all(), 'subjects'] as const,
    summary: () => [...queryKeys.subjectsPage.all(), 'summary'] as const,
    signals: () => [...queryKeys.subjectsPage.all(), 'signals'] as const,
  },
  contentDashboard: {
    summary: () => ['contentDashboard', 'summary'] as const,
    attention: (params?: Record<string, unknown>) =>
      ['contentDashboard', 'attention', ...(params ? [params] : [])] as const,
    subjects: () => ['contentDashboard', 'subjects'] as const,
    signals: () => ['contentDashboard', 'signals'] as const,
  },
  courses: {
    all: () => ['courses'] as const,
    lists: () => [...queryKeys.courses.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.courses.lists(), { page, limit }] as const,
    details: () => [...queryKeys.courses.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
  },
  liveClass: {
    all: () => ['liveClass'] as const,
    lists: () => [...queryKeys.liveClass.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.liveClass.lists(), { page, limit }] as const,
  },
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
  notesManager: {
    all: () => ['notesManager'] as const,
    overview: (topicId: string) =>
      [...queryKeys.notesManager.all(), 'overview', topicId] as const,
    teacherNotes: (topicId: string) =>
      [...queryKeys.notesManager.all(), 'teacherNotes', topicId] as const,
    aiNotes: (topicId: string) =>
      [...queryKeys.notesManager.all(), 'aiNotes', topicId] as const,
    references: (topicId: string) =>
      [...queryKeys.notesManager.all(), 'references', topicId] as const,
  },
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
  recallInsights: {
    all: (topicId: string) => ['recallInsights', topicId] as const,
    overview: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'overview'] as const,
    mcq: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'mcq'] as const,
    freeRecall: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'freeRecall'] as const,
    gaps: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'gaps'] as const,
    actions: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'actions'] as const,
    trends: (topicId: string) =>
      [...queryKeys.recallInsights.all(topicId), 'trends'] as const,
  },
  practiceTests: {
    all: (topicId: string) => ['practiceTests', topicId] as const,
    overview: (topicId: string) =>
      [...queryKeys.practiceTests.all(topicId), 'overview'] as const,
    questions: (topicId: string, params?: Record<string, unknown>) =>
      [
        ...queryKeys.practiceTests.all(topicId),
        'questions',
        ...(params ? [params] : []),
      ] as const,
    tests: (topicId: string) =>
      [...queryKeys.practiceTests.all(topicId), 'tests'] as const,
    signals: (topicId: string) =>
      [...queryKeys.practiceTests.all(topicId), 'signals'] as const,
    analytics: (topicId: string) =>
      [...queryKeys.practiceTests.all(topicId), 'analytics'] as const,
  },
} as const
