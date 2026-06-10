import {
  type AiNote,
  type AxiosConfigOptions,
  type NotesOverview,
  notesManagerService,
  type Reference,
  type TeacherNote,
} from '@aspiron/api-client'
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

// --- Overview ---

export interface UseNotesOverviewQueryOptions
  extends Omit<UseQueryOptions<NotesOverview, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useNotesOverviewQuery = (
  options: UseNotesOverviewQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.notesManager.overview(options.args.topicId)],
    queryFn: () =>
      notesManagerService.getOverview({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

// --- Teacher Notes ---

export interface UseTeacherNotesQueryOptions
  extends Omit<UseQueryOptions<TeacherNote, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTeacherNotesQuery = (options: UseTeacherNotesQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.notesManager.teacherNotes(options.args.topicId)],
    queryFn: () =>
      notesManagerService.getTeacherNotes({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseUpdateTeacherNotesMutationOptions
  extends Omit<
    UseMutationOptions<
      TeacherNote,
      Error,
      { topicId: string; content: string; status?: string }
    >,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useUpdateTeacherNotesMutation = (
  options?: UseUpdateTeacherNotesMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.updateTeacherNotes({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.teacherNotes(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

export interface UsePublishNotesMutationOptions
  extends Omit<
    UseMutationOptions<TeacherNote, Error, { topicId: string }>,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const usePublishNotesMutation = (
  options?: UsePublishNotesMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.publishNotes({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.teacherNotes(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

export interface UseUnpublishNotesMutationOptions
  extends Omit<
    UseMutationOptions<TeacherNote, Error, { topicId: string }>,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useUnpublishNotesMutation = (
  options?: UseUnpublishNotesMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.unpublishNotes({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.teacherNotes(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

// --- AI Notes ---

export interface UseAiNotesQueryOptions
  extends Omit<UseQueryOptions<AiNote[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useAiNotesQuery = (options: UseAiNotesQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.notesManager.aiNotes(options.args.topicId)],
    queryFn: () =>
      notesManagerService.getAiNotes({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseApproveAiNotesMutationOptions
  extends Omit<
    UseMutationOptions<AiNote, Error, { topicId: string; noteId: string }>,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useApproveAiNotesMutation = (
  options?: UseApproveAiNotesMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.approveAiNotes({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.aiNotes(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

// --- References ---

export interface UseReferencesQueryOptions
  extends Omit<UseQueryOptions<Reference[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useReferencesQuery = (options: UseReferencesQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.notesManager.references(options.args.topicId)],
    queryFn: () =>
      notesManagerService.getReferences({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseCreateReferenceMutationOptions
  extends Omit<
    UseMutationOptions<
      Reference,
      Error,
      {
        topicId: string
        title: string
        source: string
        referenceType: string
        url: string
      }
    >,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useCreateReferenceMutation = (
  options?: UseCreateReferenceMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.createReference({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.references(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

export interface UseDeleteReferenceMutationOptions
  extends Omit<
    UseMutationOptions<void, Error, { topicId: string; referenceId: string }>,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useDeleteReferenceMutation = (
  options?: UseDeleteReferenceMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.deleteReference({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.references(variables.topicId)],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.overview(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}

export interface UseToggleReferenceVisibilityMutationOptions
  extends Omit<
    UseMutationOptions<
      Reference,
      Error,
      { topicId: string; referenceId: string }
    >,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useToggleReferenceVisibilityMutation = (
  options?: UseToggleReferenceVisibilityMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (args) =>
      notesManagerService.toggleReferenceVisibility({
        options: { axiosConfig },
        args,
      }),
    onSuccess: (_data, variables, _mutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notesManager.references(variables.topicId)],
      })
      options?.onSuccess?.(_data, variables, _mutateResult, context)
    },
  })
}
