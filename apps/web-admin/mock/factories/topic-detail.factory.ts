import type {
  TopicAction,
  TopicComponent,
  TopicIssue,
  TopicOverview,
  TopicTrends,
  TrendDataPoint,
} from '@aspiron/api-client'

let nextId = 1

export function resetIdCounter() {
  nextId = 1
}

function uid() {
  return `topic-detail-${nextId++}`
}

export function buildTopicOverview(
  overrides?: Partial<TopicOverview>,
): TopicOverview {
  return {
    recall_strength: 'weak',
    practice_accuracy: 48,
    dropoff_indicator: 'high',
    engagement_trend: 'declining',
    ...overrides,
  }
}

export function buildTopicIssue(overrides?: Partial<TopicIssue>): TopicIssue {
  const issues = [
    {
      id: 'recall-weak',
      title: 'Recall drops significantly after 5 days',
      severity: 'high',
      description:
        'Students show 37% decline in recall accuracy within the first week',
      recommendation:
        'Schedule revision sessions at increasing intervals to reinforce retention',
      action_label: 'Schedule Revision',
    },
    {
      id: 'accuracy-low',
      title: 'Practice accuracy critically low',
      severity: 'critical',
      description:
        'Average practice accuracy is 42% — students are struggling with application-level questions',
      recommendation:
        'Review question difficulty and provide step-by-step solution walkthroughs',
      action_label: 'View Practice Data',
    },
    {
      id: 'dropoff-high',
      title: 'High student drop-off rate',
      severity: 'high',
      description:
        'Only 28% of students complete recall sessions for this topic',
      recommendation:
        'Break content into shorter segments and add engagement checkpoints',
      action_label: 'View Video Analytics',
    },
    {
      id: 'missing-video',
      title: 'No video content available',
      severity: 'medium',
      description:
        'This topic has no video lecture — video content significantly improves engagement',
      recommendation: 'Upload a video lecture to support visual learners',
      action_label: 'Open Content Review',
    },
  ]
  const idx = (nextId - 1) % issues.length
  return {
    ...issues[idx],
    ...overrides,
  }
}

export function buildTopicIssuesResponse(count?: number): TopicIssue[] {
  resetIdCounter()
  const issueTemplates = [
    {
      id: 'recall-weak',
      title: 'Recall drops significantly after 5 days',
      severity: 'high',
      description:
        'Students show 37% decline in recall accuracy within the first week',
      recommendation:
        'Schedule revision sessions at increasing intervals to reinforce retention',
      action_label: 'Schedule Revision',
    },
    {
      id: 'accuracy-low',
      title: 'Practice accuracy critically low',
      severity: 'critical',
      description:
        'Average practice accuracy is 42% — students are struggling with application-level questions',
      recommendation:
        'Review question difficulty and provide step-by-step solution walkthroughs',
      action_label: 'View Practice Data',
    },
    {
      id: 'dropoff-high',
      title: 'High student drop-off rate',
      severity: 'high',
      description:
        'Only 28% of students complete recall sessions for this topic',
      recommendation:
        'Break content into shorter segments and add engagement checkpoints',
      action_label: 'View Video Analytics',
    },
    {
      id: 'missing-video',
      title: 'No video content available',
      severity: 'medium',
      description:
        'This topic has no video lecture — video content significantly improves engagement',
      recommendation: 'Upload a video lecture to support visual learners',
      action_label: 'Open Content Review',
    },
  ]
  const items = count ? issueTemplates.slice(0, count) : issueTemplates
  return items.map((issue) => ({
    ...issue,
    id: issue.id,
  }))
}

export function buildTopicComponent(
  overrides?: Partial<TopicComponent>,
): TopicComponent {
  return {
    id: uid(),
    name: 'Video Lecture',
    status: 'published',
    performance: '62% completion',
    action: 'Manage Video',
    ...overrides,
  }
}

export function buildTopicComponentsResponse(): TopicComponent[] {
  resetIdCounter()
  return [
    {
      id: 'video',
      name: 'Video Lecture',
      status: 'published',
      performance: '62% completion rate',
      action: 'Manage Video',
    },
    {
      id: 'practice-questions',
      name: 'Practice Questions',
      status: 'published',
      performance: '12 questions available',
      action: 'Manage Questions',
    },
    {
      id: 'recall',
      name: 'Recall Performance',
      status: 'published',
      performance: '45 sessions recorded',
      action: 'View Analytics',
    },
    {
      id: 'study-notes',
      name: 'Study Notes',
      status: 'published',
      performance: '128 students accessed',
      action: 'Manage Notes',
    },
    {
      id: 'assignments',
      name: 'Assignments',
      status: 'draft',
      performance: 'Not assigned',
      action: 'Create Assignment',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      status: 'draft',
      performance: 'Not available',
      action: 'Manage Flashcards',
    },
  ]
}

export function buildTopicAction(
  overrides?: Partial<TopicAction>,
): TopicAction {
  const actions = [
    {
      id: 'preview',
      label: 'Preview As Student',
      description: "View the topic from a student's perspective",
      icon: 'eye',
    },
    {
      id: 'schedule',
      label: 'Schedule Revision Class',
      description: 'Create a revision session for this topic',
      icon: 'calendar',
    },
    {
      id: 'review',
      label: 'Mark Topic For Review',
      description: 'Flag this topic for content review',
      icon: 'flag',
    },
    {
      id: 'assign',
      label: 'Assign Practice Set',
      description: 'Assign practice questions to students',
      icon: 'book',
    },
    {
      id: 'notes',
      label: 'Generate Revision Notes',
      description: 'Auto-generate revision notes from content',
      icon: 'file',
    },
    {
      id: 'review-q',
      label: 'Review Questions',
      description: 'Review and update practice questions',
      icon: 'edit',
    },
  ]
  return {
    ...actions[(nextId - 1) % actions.length],
    ...overrides,
  }
}

export function buildTopicActionsResponse(): TopicAction[] {
  resetIdCounter()
  return [
    {
      id: 'preview-as-student',
      label: 'Preview As Student',
      description: "View the topic from a student's perspective",
      icon: 'eye',
    },
    {
      id: 'schedule-revision',
      label: 'Schedule Revision Class',
      description: 'Create a revision session for this topic',
      icon: 'calendar',
    },
    {
      id: 'mark-for-review',
      label: 'Mark Topic For Review',
      description: 'Flag this topic for content review',
      icon: 'flag',
    },
    {
      id: 'assign-practice',
      label: 'Assign Practice Set',
      description: 'Assign practice questions to students',
      icon: 'book',
    },
    {
      id: 'generate-notes',
      label: 'Generate Revision Notes',
      description: 'Auto-generate revision notes from content',
      icon: 'file',
    },
    {
      id: 'review-questions',
      label: 'Review Questions',
      description: 'Review and update practice questions',
      icon: 'edit',
    },
  ]
}

function buildTrendDataPoint(
  overrides?: Partial<TrendDataPoint>,
): TrendDataPoint {
  return {
    date: '2026-01-15',
    value: 65,
    ...overrides,
  }
}

export function buildTopicTrendsResponse(): TopicTrends {
  resetIdCounter()
  const recallData = [
    { date: '2026-01-01', value: 72 },
    { date: '2026-01-08', value: 58 },
    { date: '2026-01-15', value: 45 },
    { date: '2026-01-22', value: 41 },
    { date: '2026-01-29', value: 38 },
  ]
  const accuracyData = [
    { date: '2026-01-05', value: 55 },
    { date: '2026-01-12', value: 48 },
    { date: '2026-01-19', value: 52 },
    { date: '2026-01-26', value: 45 },
  ]
  const engagementData = [
    { date: '2026-01-01', value: 24 },
    { date: '2026-01-08', value: 18 },
    { date: '2026-01-15', value: 12 },
    { date: '2026-01-22', value: 8 },
    { date: '2026-01-29', value: 6 },
  ]
  const completionData = [
    { date: '2026-01-05', value: 100 },
    { date: '2026-01-12', value: 100 },
    { date: '2026-01-19', value: 100 },
    { date: '2026-01-26', value: 100 },
  ]

  return {
    recall_trend: recallData.map(buildTrendDataPoint),
    practice_accuracy_trend: accuracyData.map(buildTrendDataPoint),
    engagement_trend: engagementData.map(buildTrendDataPoint),
    completion_trend: completionData.map(buildTrendDataPoint),
  }
}
