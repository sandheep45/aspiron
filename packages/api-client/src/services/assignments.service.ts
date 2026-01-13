/**
 * Assignment management service methods
 */

import { apiClient } from '@/client/axios-instance'

// Types
export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseTitle: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentRequest {
  title: string
  description: string
  courseId: string
  dueDate: string
}

export interface UpdateAssignmentRequest {
  title?: string
  description?: string
  dueDate?: string
}

export interface AssignmentsResponse {
  assignments: Assignment[]
  total: number
  page: number
  limit: number
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  content: string
  submittedAt: string
  grade?: number
  feedback?: string
}

export interface SubmitAssignmentRequest {
  content: string
}

// Assignment service methods
export const assignmentsService = {
  /**
   * Get assignments for a course
   */
  async getAssignments(
    courseId: string,
    page = 1,
    limit = 10,
  ): Promise<AssignmentsResponse> {
    const response = await apiClient.get<AssignmentsResponse>(
      `/courses/${courseId}/assignments`,
      {
        params: { page, limit },
      },
    )
    return response.data
  },

  /**
   * Get assignment by ID
   */
  async getAssignment(id: string): Promise<Assignment> {
    const response = await apiClient.get<Assignment>(`/assignments/${id}`)
    return response.data
  },

  /**
   * Create new assignment
   */
  async createAssignment(
    assignmentData: CreateAssignmentRequest,
  ): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(
      '/assignments',
      assignmentData,
    )
    return response.data
  },

  /**
   * Update assignment
   */
  async updateAssignment(
    id: string,
    assignmentData: UpdateAssignmentRequest,
  ): Promise<Assignment> {
    const response = await apiClient.put<Assignment>(
      `/assignments/${id}`,
      assignmentData,
    )
    return response.data
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}`)
  },

  /**
   * Submit assignment
   */
  async submitAssignment(
    assignmentId: string,
    submission: SubmitAssignmentRequest,
  ): Promise<AssignmentSubmission> {
    const response = await apiClient.post<AssignmentSubmission>(
      `/assignments/${assignmentId}/submit`,
      submission,
    )
    return response.data
  },

  /**
   * Get submissions for an assignment (teacher only)
   */
  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const response = await apiClient.get<AssignmentSubmission[]>(
      `/assignments/${assignmentId}/submissions`,
    )
    return response.data
  },
}
