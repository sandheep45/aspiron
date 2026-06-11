import type {
  DifficultyBreakdownItem,
  FreeRecallResponse,
  McqQuestionItem,
  McqRecallResponse,
  MemoryGapItem,
  MemoryGapMapResponse,
  MissingConceptItem,
  RecallOverview,
  RecallStatus,
  RecallTrendDataPoint,
  RecallTrendsResponse,
  SuggestedActionItem,
} from '@aspiron/api-client'

let idCounter = 1

export function uid(): string {
  const id = `ri-${String(idCounter).padStart(4, '0')}`
  idCounter++
  return id
}

export function resetIdCounter(): void {
  idCounter = 1
}

export function buildRecallOverview(
  overrides?: Partial<RecallOverview>,
): RecallOverview {
  return {
    avg_recall_score: 72.5,
    completion_rate: 85.0,
    memory_decay: 'stable',
    last_recall_run: '2 hours ago',
    ...overrides,
  }
}

export function buildDifficultyBreakdownItem(
  overrides?: Partial<DifficultyBreakdownItem>,
): DifficultyBreakdownItem {
  return {
    difficulty: 'Medium',
    accuracy: 75.0,
    count: 5 as unknown as bigint,
    ...overrides,
  }
}

export function buildMcqQuestionItem(
  overrides?: Partial<McqQuestionItem>,
): McqQuestionItem {
  return {
    question_number: `Q-${String(idCounter).padStart(4, '0')}`,
    concept: 'What is the derivative of x²?',
    difficulty: 'Medium',
    recall_accuracy: 100.0,
    attempts: 1 as unknown as bigint,
    ...overrides,
  }
}

export function buildMcqRecallResponse(
  overrides?: Partial<McqRecallResponse>,
): McqRecallResponse {
  const id = uid()
  return {
    overall_accuracy: 72.5,
    total_questions_attempted: 12 as unknown as bigint,
    difficulty_breakdown: [
      buildDifficultyBreakdownItem({
        difficulty: 'Easy',
        accuracy: 92.0,
        count: 4 as unknown as bigint,
      }),
      buildDifficultyBreakdownItem({
        difficulty: 'Medium',
        accuracy: 75.0,
        count: 5 as unknown as bigint,
      }),
      buildDifficultyBreakdownItem({
        difficulty: 'Hard',
        accuracy: 55.0,
        count: 3 as unknown as bigint,
      }),
    ],
    questions: [
      buildMcqQuestionItem({
        question_number: `Q-${id}-001`,
        concept: "Gauss's Law Statement",
        difficulty: 'Easy',
      }),
      buildMcqQuestionItem({
        question_number: `Q-${id}-002`,
        concept: 'Flux Calculation',
        difficulty: 'Medium',
        recall_accuracy: 0.0,
      }),
    ],
    ...overrides,
  }
}

export function buildMissingConceptItem(
  overrides?: Partial<MissingConceptItem>,
): MissingConceptItem {
  return {
    concept: 'Mathematical derivation for spherical symmetry',
    percentage_missing: 62.0,
    ai_summary:
      "Students consistently omit the derivation steps for Gauss's law applications.",
    ...overrides,
  }
}

export function buildFreeRecallResponse(
  overrides?: Partial<FreeRecallResponse>,
): FreeRecallResponse {
  return {
    participation_rate: 60.0,
    ai_clarity_score: 72.5,
    average_response_length: 85 as unknown as bigint,
    missing_concepts: [
      buildMissingConceptItem({
        concept: 'Mathematical derivation for spherical symmetry',
        percentage_missing: 62.0,
      }),
      buildMissingConceptItem({
        concept: 'Sign conventions for enclosed charge',
        percentage_missing: 48.0,
      }),
      buildMissingConceptItem({
        concept: 'Real-world applications and examples',
        percentage_missing: 35.0,
      }),
    ],
    ...overrides,
  }
}

export function buildMemoryGapItem(
  overrides?: Partial<MemoryGapItem>,
): MemoryGapItem {
  return {
    concept: "Gauss's Law Statement",
    recall_status: 'remembered' as RecallStatus,
    confidence: 85.0,
    correctness: 90.0,
    ...overrides,
  }
}

export function buildMemoryGapMapResponse(
  overrides?: Partial<MemoryGapMapResponse>,
): MemoryGapMapResponse {
  return {
    items: [
      buildMemoryGapItem({
        concept: "Gauss's Law Statement",
        recall_status: 'remembered' as RecallStatus,
        confidence: 85.0,
        correctness: 90.0,
      }),
      buildMemoryGapItem({
        concept: 'Flux Calculation',
        recall_status: 'partial' as RecallStatus,
        confidence: 60.0,
        correctness: 50.0,
      }),
      buildMemoryGapItem({
        concept: 'Spherical Symmetry',
        recall_status: 'forgotten' as RecallStatus,
        confidence: 30.0,
        correctness: 20.0,
        mismatch_alert: 'High Confidence, Low Accuracy',
      }),
    ],
    ...overrides,
  }
}

export function buildSuggestedActionItem(
  overrides?: Partial<SuggestedActionItem>,
): SuggestedActionItem {
  return {
    id: uid(),
    icon: 'alert-triangle',
    detected_issue: 'Students struggle with spherical symmetry calculations',
    explanation:
      '62% of students missed mathematical derivation for spherical symmetry.',
    suggested_fix: 'Review derivation video at 7:20.',
    primary_cta: 'Review Video',
    ...overrides,
  }
}

export function buildSuggestedActionsResponse(
  overrides?: Partial<SuggestedActionItem[]>,
): SuggestedActionItem[] {
  const items = [
    buildSuggestedActionItem({
      id: 'spherical-symmetry',
      icon: 'alert-triangle',
      detected_issue: 'Students struggle with spherical symmetry calculations',
    }),
    buildSuggestedActionItem({
      id: 'hard-mcq-recall',
      icon: 'bar-chart',
      detected_issue: 'Hard difficulty MCQs show significantly lower recall',
    }),
    buildSuggestedActionItem({
      id: 'memory-decay',
      icon: 'trending-down',
      detected_issue: 'Memory decay indicates forgetting after 7 days',
    }),
    buildSuggestedActionItem({
      id: 'sign-convention',
      icon: 'help-circle',
      detected_issue: 'Sign conventions frequently misapplied in flux problems',
    }),
  ]
  return overrides ?? items
}

export function buildTrendDataPoint(
  overrides?: Partial<RecallTrendDataPoint>,
): RecallTrendDataPoint {
  return {
    date: '2026-01-15',
    value: 72.5,
    ...overrides,
  }
}

export function buildRecallTrendsResponse(
  overrides?: Partial<RecallTrendsResponse>,
): RecallTrendsResponse {
  return {
    recall_trend: [
      buildTrendDataPoint({ date: '2026-01-01', value: 85.0 }),
      buildTrendDataPoint({ date: '2026-01-08', value: 72.0 }),
      buildTrendDataPoint({ date: '2026-01-15', value: 58.0 }),
    ],
    memory_decay_curve: [
      buildTrendDataPoint({ date: '2026-01-01', value: 100.0 }),
      buildTrendDataPoint({ date: '2026-01-08', value: 86.0 }),
      buildTrendDataPoint({ date: '2026-01-15', value: 74.0 }),
    ],
    recall_by_difficulty: [
      buildTrendDataPoint({ date: '2026-01-01', value: 65.0 }),
      buildTrendDataPoint({ date: '2026-01-08', value: 62.0 }),
    ],
    retention_distribution: [
      buildTrendDataPoint({ date: '2026-01-01', value: 40.0 }),
    ],
    ...overrides,
  }
}
