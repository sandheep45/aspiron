/**
 * Assignment management hooks using TanStack Query
 */

import {
  type Assignment,
  assignmentsService,
  type SubmitAssignmentRequest,
  type UpdateAssignmentRequest,
} from '@aspiron/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/types/query-keys'

// Types
export interface UseAssignmentsReturn {
  assignments: Assignment[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseAssignmentReturn {
  assignment: Assignment | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get assignments for a course
 */
export const useAssignments = (
  courseId: string,
  page = 1,
  limit = 10,
): UseAssignmentsReturn => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.assignments.list(courseId, page, limit),
    queryFn: () => assignmentsService.getAssignments(courseId, page, limit),
    enabled: !!courseId,
  })

  return {
    assignments: data?.assignments || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to get a single assignment by ID
 */
export const useAssignment = (id: string): UseAssignmentReturn => {
  const {
    data: assignment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: () => assignmentsService.getAssignment(id),
    enabled: !!id,
  })

  return {
    assignment,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to create a new assignment
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignmentsService.createAssignment,
    onSuccess: (_data) => {
      // Invalidate assignments for the course
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.lists(),
      })
    },
  })
}

/**
 * Hook to update an assignment
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      assignmentsService.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific assignment and assignments list
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
    },
  })
}

/**
 * Hook to delete an assignment
 */
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignmentsService.deleteAssignment,
    onSuccess: () => {
      // Invalidate assignments list
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
    },
  })
}

/**
 * Hook to submit an assignment
 */
export const useSubmitAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      assignmentId,
      submission,
    }: {
      assignmentId: string
      submission: SubmitAssignmentRequest
    }) => assignmentsService.submitAssignment(assignmentId, submission),
    onSuccess: (_, variables) => {
      // Invalidate assignment details and submissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(variables.assignmentId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.submissions(variables.assignmentId),
      })
    },
  })
}

/**
 * Hook to get assignment submissions (teacher only)
 */
export const useAssignmentSubmissions = (assignmentId: string) => {
  return useQuery({
    queryKey: queryKeys.assignments.submissions(assignmentId),
    queryFn: () => assignmentsService.getSubmissions(assignmentId),
    enabled: !!assignmentId,
  })
}
