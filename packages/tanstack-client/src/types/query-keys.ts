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
