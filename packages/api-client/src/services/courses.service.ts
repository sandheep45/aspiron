/**
 * Course management service methods
 */

import { apiClient } from '@/client/axios-instance'

// Types
export interface Course {
  id: string
  title: string
  description: string
  teacherId: string
  teacherName: string
  createdAt: string
  updatedAt: string
}

export interface CreateCourseRequest {
  title: string
  description: string
}

export interface UpdateCourseRequest {
  title?: string
  description?: string
}

export interface CoursesResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
}

export interface EnrollResponse {
  success: boolean
  message: string
}

// Course service methods
export const coursesService = {
  /**
   * Get all courses with pagination
   */
  async getCourses(page = 1, limit = 10): Promise<CoursesResponse> {
    const response = await apiClient.get<CoursesResponse>('/courses', {
      params: { page, limit },
    })
    return response.data
  },

  /**
   * Get course by ID
   */
  async getCourse(id: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${id}`)
    return response.data
  },

  /**
   * Create new course
   */
  async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', courseData)
    return response.data
  },

  /**
   * Update course
   */
  async updateCourse(
    id: string,
    courseData: UpdateCourseRequest,
  ): Promise<Course> {
    const response = await apiClient.put<Course>(`/courses/${id}`, courseData)
    return response.data
  },

  /**
   * Delete course
   */
  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`)
  },

  /**
   * Enroll student in course
   */
  async enrollStudent(courseId: string): Promise<EnrollResponse> {
    const response = await apiClient.post<EnrollResponse>(
      `/courses/${courseId}/enroll`,
    )
    return response.data
  },
}
