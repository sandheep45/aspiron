import {
  buildTopicAction,
  buildTopicActionsResponse,
  buildTopicComponent,
  buildTopicComponentsResponse,
  buildTopicIssue,
  buildTopicIssuesResponse,
  buildTopicOverview,
  buildTopicTrendsResponse,
  resetIdCounter,
} from '@mock/factories/topic-detail.factory'
import { describe, expect, it } from 'vitest'

describe('topic-detail factory', () => {
  describe('buildTopicOverview', () => {
    it('creates with default values', () => {
      const overview = buildTopicOverview()
      expect(overview.recall_strength).toBe('weak')
      expect(overview.practice_accuracy).toBe(48)
      expect(overview.dropoff_indicator).toBe('high')
      expect(overview.engagement_trend).toBe('declining')
    })

    it('overrides fields', () => {
      const overview = buildTopicOverview({
        recall_strength: 'strong',
        practice_accuracy: 92,
      })
      expect(overview.recall_strength).toBe('strong')
      expect(overview.practice_accuracy).toBe(92)
    })
  })

  describe('buildTopicIssue', () => {
    it('creates with default values', () => {
      const issue = buildTopicIssue()
      expect(issue.id).toBe('recall-weak')
      expect(issue.severity).toBe('high')
      expect(issue.title).toBeTruthy()
      expect(issue.description).toBeTruthy()
      expect(issue.recommendation).toBeTruthy()
      expect(issue.action_label).toBeTruthy()
    })

    it('overrides fields', () => {
      const issue = buildTopicIssue({ severity: 'low' })
      expect(issue.severity).toBe('low')
    })
  })

  describe('buildTopicIssuesResponse', () => {
    it('creates all 4 issues by default', () => {
      const issues = buildTopicIssuesResponse()
      expect(issues).toHaveLength(4)
    })

    it('creates requested count', () => {
      const issues = buildTopicIssuesResponse(2)
      expect(issues).toHaveLength(2)
    })

    it('each issue has required fields', () => {
      const issues = buildTopicIssuesResponse()
      for (const issue of issues) {
        expect(issue.id).toBeTruthy()
        expect(issue.title).toBeTruthy()
        expect(issue.severity).toBeTruthy()
        expect(issue.description).toBeTruthy()
        expect(issue.recommendation).toBeTruthy()
      }
    })
  })

  describe('buildTopicComponent', () => {
    it('creates with default values', () => {
      const component = buildTopicComponent()
      expect(component.name).toBe('Video Lecture')
      expect(component.status).toBe('published')
      expect(component.performance).toBe('62% completion')
      expect(component.action).toBe('Manage Video')
    })

    it('uses uid for default id', () => {
      resetIdCounter()
      expect(buildTopicComponent().id).toBe('topic-detail-1')
    })

    it('overrides fields', () => {
      const component = buildTopicComponent({ name: 'Quiz', status: 'draft' })
      expect(component.name).toBe('Quiz')
      expect(component.status).toBe('draft')
    })
  })

  describe('buildTopicComponentsResponse', () => {
    it('returns 6 components', () => {
      const components = buildTopicComponentsResponse()
      expect(components).toHaveLength(6)
    })

    it('has stable IDs', () => {
      const components = buildTopicComponentsResponse()
      expect(components[0].id).toBe('video')
      expect(components[4].id).toBe('assignments')
    })

    it('includes draft and published statuses', () => {
      const components = buildTopicComponentsResponse()
      const statuses = components.map((c) => c.status)
      expect(statuses).toContain('published')
      expect(statuses).toContain('draft')
    })
  })

  describe('buildTopicAction', () => {
    it('creates with default values', () => {
      const action = buildTopicAction()
      expect(action.id).toBe('preview')
      expect(action.label).toBe('Preview As Student')
      expect(action.icon).toBe('eye')
    })

    it('overrides fields', () => {
      const action = buildTopicAction({ label: 'Custom' })
      expect(action.label).toBe('Custom')
    })
  })

  describe('buildTopicActionsResponse', () => {
    it('returns 6 actions', () => {
      const actions = buildTopicActionsResponse()
      expect(actions).toHaveLength(6)
    })

    it('each action has required fields', () => {
      const actions = buildTopicActionsResponse()
      for (const action of actions) {
        expect(action.id).toBeTruthy()
        expect(action.label).toBeTruthy()
        expect(action.description).toBeTruthy()
        expect(action.icon).toBeTruthy()
      }
    })
  })

  describe('buildTopicTrendsResponse', () => {
    it('returns all 4 trend arrays', () => {
      const trends = buildTopicTrendsResponse()
      expect(trends.recall_trend).toBeTruthy()
      expect(trends.practice_accuracy_trend).toBeTruthy()
      expect(trends.engagement_trend).toBeTruthy()
      expect(trends.completion_trend).toBeTruthy()
    })

    it('recall_trend has points with date and value', () => {
      const trends = buildTopicTrendsResponse()
      expect(trends.recall_trend.length).toBeGreaterThan(0)
      for (const point of trends.recall_trend) {
        expect(point.date).toBeTruthy()
        expect(typeof point.value).toBe('number')
      }
    })

    it('completion_trend always has value 100', () => {
      const trends = buildTopicTrendsResponse()
      for (const point of trends.completion_trend) {
        expect(point.value).toBe(100)
      }
    })
  })
})
