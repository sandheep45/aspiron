import { HttpResponse, http } from 'msw'

export const healthHandlers = [
  http.get('*/api/v1/health', () => {
    return HttpResponse.json({ status: 'healthy', version: '0.1.0' })
  }),
]
