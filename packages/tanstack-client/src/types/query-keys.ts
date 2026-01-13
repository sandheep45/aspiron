/**
 * Query key definitions for consistent caching
 */

export const queryKeys = {
  // Authentication
  auth: {
    currentUser: () => ['auth', 'currentUser'] as const,
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

  // Courses
  courses: {
    all: () => ['courses'] as const,
    lists: () => [...queryKeys.courses.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.courses.lists(), { page, limit }] as const,
    details: () => [...queryKeys.courses.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
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
