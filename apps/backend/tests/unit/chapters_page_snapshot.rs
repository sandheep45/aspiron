use backend::http::responses::chapters_page::{
    ChapterItemResponse, ChapterSummaryResponse, InsightItemResponse,
};

#[test]
fn chapter_summary_response() {
    let response = ChapterSummaryResponse {
        subject_name: "Physics".to_string(),
        total_chapters: 8,
        published_topics: 45,
        draft_topics: 12,
        chapters_needing_attention: 2,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("chapter-summary-response", value);
}

#[test]
fn chapter_item_response() {
    let response = ChapterItemResponse {
        id: "ch-1".to_string(),
        name: "Mechanics".to_string(),
        published_topics: 12,
        total_topics: 15,
        coverage: 80.0,
        avg_recall: "medium".to_string(),
        practice_accuracy: 74.0,
        status: "healthy".to_string(),
        last_updated: "2 days ago".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("chapter-item-response", value);
}

#[test]
fn chapter_item_null_metrics() {
    let response = ChapterItemResponse {
        id: "ch-2".to_string(),
        name: "Thermodynamics".to_string(),
        published_topics: 0,
        total_topics: 10,
        coverage: 0.0,
        avg_recall: "medium".to_string(),
        practice_accuracy: 0.0,
        status: "healthy".to_string(),
        last_updated: "Never".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("chapter-item-null-metrics", value);
}

#[test]
fn insight_item_positive() {
    let response = InsightItemResponse {
        id: "ins-1".to_string(),
        signal_type: "positive".to_string(),
        title: "Strong Recall".to_string(),
        description: "Mechanics has the highest recall rate at 85%".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("insight-item-positive", value);
}

#[test]
fn insight_item_warning() {
    let response = InsightItemResponse {
        id: "ins-2".to_string(),
        signal_type: "warning".to_string(),
        title: "Mixed Performance".to_string(),
        description: "Thermodynamics shows mixed recall across topics".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("insight-item-warning", value);
}

#[test]
fn insight_item_negative() {
    let response = InsightItemResponse {
        id: "ins-3".to_string(),
        signal_type: "negative".to_string(),
        title: "Low Accuracy".to_string(),
        description: "Optics has the lowest practice accuracy at 32%".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("insight-item-negative", value);
}

#[test]
fn insight_item_info() {
    let response = InsightItemResponse {
        id: "ins-4".to_string(),
        signal_type: "info".to_string(),
        title: "Steady Progress".to_string(),
        description: "All chapters show consistent improvement over last month".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("insight-item-info", value);
}
