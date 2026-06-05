use backend::http::responses::content_dashboard::{
    ContentDashboardAttentionItem, ContentDashboardAttentionResponse, ContentDashboardSignalItem,
    ContentDashboardSignalsResponse, ContentDashboardSubjectProgress,
    ContentDashboardSummaryResponse,
};
use uuid::Uuid;

fn strip_uuids(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Object(obj) => {
            obj.remove("id");
            for v in obj.values_mut() {
                strip_uuids(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                strip_uuids(v);
            }
        }
        _ => {}
    }
}

#[test]
fn summary_response() {
    let response = ContentDashboardSummaryResponse {
        subjects_covered: 5,
        topics_published: 42,
        topics_in_draft: 3,
        topics_flagged: 1,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("content-dashboard-summary", value);
}

#[test]
fn attention_response() {
    let response = ContentDashboardAttentionResponse {
        total: 2,
        items: vec![
            ContentDashboardAttentionItem {
                id: Uuid::new_v4(),
                topic: "Newton's Laws".to_string(),
                issue: "Low Recall".to_string(),
                reason: "Students showing recall decline".to_string(),
                students_affected: 23,
            },
            ContentDashboardAttentionItem {
                id: Uuid::new_v4(),
                topic: "Quadratic Equations".to_string(),
                issue: "Poor Accuracy".to_string(),
                reason: "Accuracy below 60% threshold".to_string(),
                students_affected: 15,
            },
        ],
    };
    let mut value = serde_json::to_value(response).expect("serialize");
    strip_uuids(&mut value);
    insta::assert_json_snapshot!("content-dashboard-attention", value);
}

#[test]
fn subject_progress() {
    let response = ContentDashboardSubjectProgress {
        id: "subject-uuid".to_string(),
        name: "Physics".to_string(),
        completion: 87.5,
        total_topics: 68,
        published_topics: 59,
        draft_topics: 9,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("content-dashboard-subject-progress", value);
}

#[test]
fn signal_item_with_score() {
    let item = ContentDashboardSignalItem {
        topic: "Modern Physics - Photoelectric Effect".to_string(),
        score: Some(84.0),
        drop: None,
    };
    let value = serde_json::to_value(item).expect("serialize");
    insta::assert_json_snapshot!("content-dashboard-signal-score", value);
}

#[test]
fn signal_item_with_drop() {
    let item = ContentDashboardSignalItem {
        topic: "Electrostatics - Gauss's Law".to_string(),
        score: None,
        drop: Some(28.0),
    };
    let value = serde_json::to_value(item).expect("serialize");
    insta::assert_json_snapshot!("content-dashboard-signal-drop", value);
}

#[test]
fn signals_response() {
    let response = ContentDashboardSignalsResponse {
        highest_recall: vec![
            ContentDashboardSignalItem {
                topic: "Modern Physics".to_string(),
                score: Some(84.0),
                drop: None,
            },
            ContentDashboardSignalItem {
                topic: "Chemical Bonding".to_string(),
                score: Some(79.0),
                drop: None,
            },
        ],
        fastest_decay: vec![
            ContentDashboardSignalItem {
                topic: "Electrostatics".to_string(),
                score: None,
                drop: Some(28.0),
            },
            ContentDashboardSignalItem {
                topic: "Thermodynamics".to_string(),
                score: None,
                drop: Some(31.0),
            },
        ],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("content-dashboard-signals", value);
}
