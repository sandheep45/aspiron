import { HttpResponse, http } from 'msw'
import {
  buildSubjectPageItemsResponse,
  buildSubjectSignalsResponse,
  buildSubjectSummary,
} from '../factories/subjects-page.factory'

export const subjectsPageHandlers = [
  http.get('*/api/v1/content/subjects-page', () => {
    return HttpResponse.json(buildSubjectPageItemsResponse(4))
  }),

  http.get('*/api/v1/content/subjects-page/summary', () => {
    return HttpResponse.json(buildSubjectSummary())
  }),

  http.get('*/api/v1/content/subjects-page/signals', () => {
    return HttpResponse.json(buildSubjectSignalsResponse(4))
  }),
]
