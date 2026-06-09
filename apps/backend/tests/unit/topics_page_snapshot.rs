use backend::http::responses::topics_page::{
    InsightItemResponse, TopicItemResponse, TopicSummaryResponse,
};

#[test]
fn topic_summary_response() {
    let response = TopicSummaryResponse {
        chapter_name: "Electrostatics".to_string(),
        total_topics: 8,
        published_topics: 6,
        draft_topics: 2,
        weak_topics: 1,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-summary-response", value);
}

#[test]
fn topic_summary_empty() {
    let response = TopicSummaryResponse {
        chapter_name: "Empty Chapter".to_string(),
        total_topics: 0,
        published_topics: 0,
        draft_topics: 0,
        weak_topics: 0,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-summary-empty", value);
}

#[test]
fn topic_item_response() {
    let response = TopicItemResponse {
        id: "topic-1".to_string(),
        name: "Coulomb's Law".to_string(),
        content_status: "published".to_string(),
        video_available: true,
        recall_strength: "strong".to_string(),
        practice_accuracy: 90.0,
        last_activity: "2 hours ago".to_string(),
        status: "healthy".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-item-response", value);
}

#[test]
fn topic_item_response_draft() {
    let response = TopicItemResponse {
        id: "topic-2".to_string(),
        name: "Electric Field".to_string(),
        content_status: "draft".to_string(),
        video_available: false,
        recall_strength: "weak".to_string(),
        practice_accuracy: 35.0,
        last_activity: "Never".to_string(),
        status: "critical".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-item-draft", value);
}

#[test]
fn insight_item_positive() {
    let response = InsightItemResponse {
        id: "ins-1".to_string(),
        signal_type: "positive".to_string(),
        title: "All topics fully equipped".to_string(),
        description: "Every topic in this chapter has both video content and assessment quizzes."
            .to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-insight-positive", value);
}

#[test]
fn insight_item_warning() {
    let response = InsightItemResponse {
        id: "ins-2".to_string(),
        signal_type: "warning".to_string(),
        title: "Topics with low recall".to_string(),
        description: "Coulomb's Law, Electric Field have significantly lower recall rates."
            .to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-insight-warning", value);
}

#[test]
fn insight_item_negative() {
    let response = InsightItemResponse {
        id: "ins-3".to_string(),
        signal_type: "negative".to_string(),
        title: "Practice accuracy concerns".to_string(),
        description: "Gauss Law shows practice accuracy below 50%.".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-insight-negative", value);
}

#[test]
fn insight_item_info() {
    let response = InsightItemResponse {
        id: "ins-4".to_string(),
        signal_type: "info".to_string(),
        title: "Topics without quizzes".to_string(),
        description: "Faraday's Law has no assessment quizzes configured.".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-insight-info", value);
}
