import { getClient, type ServiceOptions } from '@/client/axios-instance'

export interface UploadFileResponse {
  url: string
  file_key: string
}

export const uploadService = {
  uploadFile: async (
    filename: string,
    contentType: string,
    body: Blob,
    options?: ServiceOptions,
  ): Promise<UploadFileResponse> => {
    const client = getClient(options)
    const response = await client.put<UploadFileResponse>(
      `/upload/file?filename=${encodeURIComponent(filename)}&content_type=${encodeURIComponent(contentType)}`,
      body,
      {
        headers: {
          'Content-Type': contentType,
        },
        timeout: 120_000,
      },
    )
    return response.data
  },
}
