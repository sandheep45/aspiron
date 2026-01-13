/**
 * Course management hooks using TanStack Query
 */

import {
  type Course,
  coursesService,
  type UpdateCourseRequest,
} from '@aspiron/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/types/query-keys'

// Types
export interface UseCoursesReturn {
  courses: Course[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseCourseReturn {
  course: Course | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get all courses with pagination
 */
export const useCourses = (page = 1, limit = 10): UseCoursesReturn => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.courses.list(page, limit),
    queryFn: () => coursesService.getCourses(page, limit),
  })

  return {
    courses: data?.courses || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to get a single course by ID
 */
export const useCourse = (id: string): UseCourseReturn => {
  const {
    data: course,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => coursesService.getCourse(id),
    enabled: !!id,
  })

  return {
    course,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to create a new course
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursesService.createCourse,
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() })
    },
  })
}

/**
 * Hook to update a course
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) =>
      coursesService.updateCourse(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific course and courses list
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() })
    },
  })
}

/**
 * Hook to delete a course
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursesService.deleteCourse,
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() })
    },
  })
}

/**
 * Hook to enroll in a course
 */
export const useEnrollCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursesService.enrollStudent,
    onSuccess: (_, courseId) => {
      // Could invalidate user courses or enrollment status
      // For now, just invalidate the course details
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId as string),
      })
    },
  })
}
