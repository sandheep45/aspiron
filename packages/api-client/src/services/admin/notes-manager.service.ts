import { getClient } from '@/client/axios-instance'
import type {
  AiNote,
  CreateReferencePayload,
  NotesOverview,
  Reference,
  TeacherNote,
  UpdateTeacherNotePayload,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const notesManagerService = {
  getOverview: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<NotesOverview> => {
    const client = getClient(options)
    const response = await client.get<NotesOverview>(
      `/topics/${args?.topicId}/notes/overview`,
    )
    return response.data
  },

  getTeacherNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TeacherNote> => {
    const client = getClient(options)
    const response = await client.get<TeacherNote>(
      `/topics/${args?.topicId}/notes`,
    )
    return response.data
  },

  updateTeacherNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
    content: string
    status?: string
  }>): Promise<TeacherNote> => {
    const client = getClient(options)
    const response = await client.put<TeacherNote>(
      `/topics/${args?.topicId}/notes`,
      {
        content: args?.content,
        status: args?.status ?? null,
      } satisfies UpdateTeacherNotePayload,
    )
    return response.data
  },

  publishNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TeacherNote> => {
    const client = getClient(options)
    const response = await client.post<TeacherNote>(
      `/topics/${args?.topicId}/notes/publish`,
    )
    return response.data
  },

  unpublishNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TeacherNote> => {
    const client = getClient(options)
    const response = await client.post<TeacherNote>(
      `/topics/${args?.topicId}/notes/unpublish`,
    )
    return response.data
  },

  getAiNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<AiNote[]> => {
    const client = getClient(options)
    const response = await client.get<AiNote[]>(
      `/topics/${args?.topicId}/ai-notes`,
    )
    return response.data
  },

  approveAiNotes: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
    noteId: string
  }>): Promise<AiNote> => {
    const client = getClient(options)
    const response = await client.post<AiNote>(
      `/topics/${args?.topicId}/ai-notes/${args?.noteId}/approve`,
    )
    return response.data
  },

  getReferences: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<Reference[]> => {
    const client = getClient(options)
    const response = await client.get<Reference[]>(
      `/topics/${args?.topicId}/references`,
    )
    return response.data
  },

  createReference: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
    title: string
    source: string
    referenceType: string
    url: string
  }>): Promise<Reference> => {
    const client = getClient(options)
    const response = await client.post<Reference>(
      `/topics/${args?.topicId}/references`,
      {
        title: args?.title,
        source: args?.source,
        reference_type: args?.referenceType,
        url: args?.url,
      } satisfies CreateReferencePayload,
    )
    return response.data
  },

  deleteReference: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
    referenceId: string
  }>): Promise<void> => {
    const client = getClient(options)
    await client.delete(
      `/topics/${args?.topicId}/references/${args?.referenceId}`,
    )
  },

  toggleReferenceVisibility: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
    referenceId: string
  }>): Promise<Reference> => {
    const client = getClient(options)
    const response = await client.post<Reference>(
      `/topics/${args?.topicId}/references/${args?.referenceId}/toggle`,
    )
    return response.data
  },
}
