use backend::http::responses::recall_insights::{
    DifficultyBreakdownItemResponse, FreeRecallResponse, McqQuestionItemResponse,
    McqRecallResponse, MemoryGapItemResponse, MemoryGapMapResponse, MissingConceptItemResponse,
    RecallOverviewResponse, RecallStatus, RecallTrendDataPointResponse, RecallTrendsResponse,
    SuggestedActionItemResponse,
};

// ---------------------------------------------------------------------------
// RecallOverviewResponse
// ---------------------------------------------------------------------------

#[test]
fn recall_overview_healthy() {
    let response = RecallOverviewResponse {
        avg_recall_score: 82.0,
        completion_rate: 90.0,
        memory_decay: "stable".to_string(),
        last_recall_run: "2 hours ago".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("recall-overview-healthy", value);
}

#[test]
fn recall_overview_zeroed() {
    let response = RecallOverviewResponse {
        avg_recall_score: 0.0,
        completion_rate: 0.0,
        memory_decay: "critical".to_string(),
        last_recall_run: "No recall runs".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("recall-overview-zeroed", value);
}

// ---------------------------------------------------------------------------
// McqRecallResponse
// ---------------------------------------------------------------------------

#[test]
fn mcq_recall_with_data() {
    let response = McqRecallResponse {
        overall_accuracy: 75.0,
        total_questions_attempted: 12,
        difficulty_breakdown: vec![
            DifficultyBreakdownItemResponse {
                difficulty: "Easy".to_string(),
                accuracy: 92.0,
                count: 4,
            },
            DifficultyBreakdownItemResponse {
                difficulty: "Medium".to_string(),
                accuracy: 75.0,
                count: 5,
            },
            DifficultyBreakdownItemResponse {
                difficulty: "Hard".to_string(),
                accuracy: 55.0,
                count: 3,
            },
        ],
        questions: vec![
            McqQuestionItemResponse {
                question_number: "Q-0001".to_string(),
                concept: "Gauss's Law Statement".to_string(),
                difficulty: "Easy".to_string(),
                recall_accuracy: 100.0,
                attempts: 1,
            },
            McqQuestionItemResponse {
                question_number: "Q-0002".to_string(),
                concept: "Flux Calculation".to_string(),
                difficulty: "Medium".to_string(),
                recall_accuracy: 0.0,
                attempts: 1,
            },
        ],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("mcq-recall-with-data", value);
}

#[test]
fn mcq_recall_empty() {
    let response = McqRecallResponse {
        overall_accuracy: 0.0,
        total_questions_attempted: 0,
        difficulty_breakdown: vec![],
        questions: vec![],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("mcq-recall-empty", value);
}

// ---------------------------------------------------------------------------
// FreeRecallResponse
// ---------------------------------------------------------------------------

#[test]
fn free_recall_with_concepts() {
    let response = FreeRecallResponse {
        participation_rate: 60.0,
        ai_clarity_score: 72.5,
        average_response_length: 85,
        missing_concepts: vec![
            MissingConceptItemResponse {
                concept: "Mathematical derivation for spherical symmetry".to_string(),
                percentage_missing: 62.0,
                ai_summary: "Students consistently omit the derivation steps.".to_string(),
            },
            MissingConceptItemResponse {
                concept: "Sign conventions for enclosed charge".to_string(),
                percentage_missing: 48.0,
                ai_summary: "Positive and negative charge signs frequently misapplied.".to_string(),
            },
        ],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("free-recall-with-concepts", value);
}

#[test]
fn free_recall_empty() {
    let response = FreeRecallResponse {
        participation_rate: 0.0,
        ai_clarity_score: 0.0,
        average_response_length: 0,
        missing_concepts: vec![],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("free-recall-empty", value);
}

// ---------------------------------------------------------------------------
// DifficultyBreakdownItemResponse + McqQuestionItemResponse + MissingConceptItem
// ---------------------------------------------------------------------------

#[test]
fn difficulty_breakdown_item_easy() {
    let response = DifficultyBreakdownItemResponse {
        difficulty: "Easy".to_string(),
        accuracy: 92.5,
        count: 4,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("difficulty-breakdown-item-easy", value);
}

#[test]
fn mcq_question_item() {
    let response = McqQuestionItemResponse {
        question_number: "Q-0001".to_string(),
        concept: "What is the derivative of x²?".to_string(),
        difficulty: "Medium".to_string(),
        recall_accuracy: 100.0,
        attempts: 1,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("mcq-question-item", value);
}

#[test]
fn missing_concept_item() {
    let response = MissingConceptItemResponse {
        concept: "Gauss's Law Application".to_string(),
        percentage_missing: 62.0,
        ai_summary: "Students struggle with spherical charge distributions.".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("missing-concept-item", value);
}

// ---------------------------------------------------------------------------
// RecallStatus enum serialization
// ---------------------------------------------------------------------------

#[test]
fn recall_status_remembered() {
    let value = serde_json::to_value(RecallStatus::Remembered).expect("serialize");
    insta::assert_json_snapshot!("recall-status-remembered", value);
}

#[test]
fn recall_status_partial() {
    let value = serde_json::to_value(RecallStatus::Partial).expect("serialize");
    insta::assert_json_snapshot!("recall-status-partial", value);
}

#[test]
fn recall_status_forgotten() {
    let value = serde_json::to_value(RecallStatus::Forgotten).expect("serialize");
    insta::assert_json_snapshot!("recall-status-forgotten", value);
}

// ---------------------------------------------------------------------------
// MemoryGapItemResponse
// ---------------------------------------------------------------------------

#[test]
fn memory_gap_item_with_alert() {
    let response = MemoryGapItemResponse {
        concept: "Flux Calculation".to_string(),
        recall_status: RecallStatus::Partial,
        confidence: 85.0,
        correctness: 33.0,
        mismatch_alert: Some("High Confidence, Low Accuracy".to_string()),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("memory-gap-item-with-alert", value);
}

#[test]
fn memory_gap_item_without_alert() {
    let response = MemoryGapItemResponse {
        concept: "Gauss's Law Statement".to_string(),
        recall_status: RecallStatus::Remembered,
        confidence: 72.0,
        correctness: 90.0,
        mismatch_alert: None,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("memory-gap-item-without-alert", value);
}

#[test]
fn memory_gap_item_forgotten() {
    let response = MemoryGapItemResponse {
        concept: "Planar Symmetry".to_string(),
        recall_status: RecallStatus::Forgotten,
        confidence: 25.0,
        correctness: 15.0,
        mismatch_alert: None,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("memory-gap-item-forgotten", value);
}

// ---------------------------------------------------------------------------
// MemoryGapMapResponse
// ---------------------------------------------------------------------------

#[test]
fn memory_gap_map_with_items() {
    let response = MemoryGapMapResponse {
        items: vec![
            MemoryGapItemResponse {
                concept: "Gauss's Law Statement".to_string(),
                recall_status: RecallStatus::Remembered,
                confidence: 85.0,
                correctness: 90.0,
                mismatch_alert: None,
            },
            MemoryGapItemResponse {
                concept: "Flux Calculation".to_string(),
                recall_status: RecallStatus::Partial,
                confidence: 60.0,
                correctness: 50.0,
                mismatch_alert: None,
            },
        ],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("memory-gap-map-with-items", value);
}

#[test]
fn memory_gap_map_empty() {
    let response = MemoryGapMapResponse { items: vec![] };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("memory-gap-map-empty", value);
}

// ---------------------------------------------------------------------------
// SuggestedActionItemResponse
// ---------------------------------------------------------------------------

#[test]
fn suggested_action_item() {
    let response = SuggestedActionItemResponse {
        id: "spherical-symmetry".to_string(),
        icon: "alert-triangle".to_string(),
        detected_issue: "Students struggle with spherical symmetry calculations".to_string(),
        explanation: "62% of students missed mathematical derivation for spherical symmetry."
            .to_string(),
        suggested_fix: "Review derivation video at 7:20.".to_string(),
        primary_cta: "Review Video".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("suggested-action-item", value);
}

// ---------------------------------------------------------------------------
// RecallTrendDataPointResponse + RecallTrendsResponse
// ---------------------------------------------------------------------------

#[test]
fn recall_trend_data_point() {
    let response = RecallTrendDataPointResponse {
        date: "2026-01-15".to_string(),
        value: 72.5,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("recall-trend-data-point", value);
}

#[test]
fn recall_trends_with_data() {
    let response = RecallTrendsResponse {
        recall_trend: vec![
            RecallTrendDataPointResponse {
                date: "2026-01-01".to_string(),
                value: 85.0,
            },
            RecallTrendDataPointResponse {
                date: "2026-01-08".to_string(),
                value: 72.0,
            },
            RecallTrendDataPointResponse {
                date: "2026-01-15".to_string(),
                value: 58.0,
            },
        ],
        memory_decay_curve: vec![
            RecallTrendDataPointResponse {
                date: "2026-01-01".to_string(),
                value: 100.0,
            },
            RecallTrendDataPointResponse {
                date: "2026-01-08".to_string(),
                value: 86.0,
            },
            RecallTrendDataPointResponse {
                date: "2026-01-15".to_string(),
                value: 74.0,
            },
        ],
        recall_by_difficulty: vec![
            RecallTrendDataPointResponse {
                date: "2026-01-01".to_string(),
                value: 65.0,
            },
            RecallTrendDataPointResponse {
                date: "2026-01-08".to_string(),
                value: 62.0,
            },
        ],
        retention_distribution: vec![RecallTrendDataPointResponse {
            date: "2026-01-01".to_string(),
            value: 40.0,
        }],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("recall-trends-with-data", value);
}

#[test]
fn recall_trends_empty() {
    let response = RecallTrendsResponse {
        recall_trend: vec![],
        memory_decay_curve: vec![],
        recall_by_difficulty: vec![],
        retention_distribution: vec![],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("recall-trends-empty", value);
}
