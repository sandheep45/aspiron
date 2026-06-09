use backend::application::content::topics_page_types::{
    TopicWithMetrics, categorize_topic_insights,
};
use backend::http::handlers::topics_page::derive_content_status;
use backend::http::handlers::topics_page::derive_topic_status;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// derive_content_status
// ---------------------------------------------------------------------------

#[test]
fn test_content_status_published_both_video_and_quiz() {
    assert_eq!(derive_content_status(true, true), "published");
}

#[test]
fn test_content_status_draft_quiz_only() {
    assert_eq!(derive_content_status(false, true), "draft");
}

#[test]
fn test_content_status_review_pending_video_only() {
    assert_eq!(derive_content_status(true, false), "review_pending");
}

#[test]
fn test_content_status_archived_neither() {
    assert_eq!(derive_content_status(false, false), "archived");
}

// ---------------------------------------------------------------------------
// derive_topic_status
// ---------------------------------------------------------------------------

#[test]
fn test_topic_status_healthy_high_recall_and_accuracy() {
    assert_eq!(derive_topic_status(Some(0.85), Some(0.90)), "healthy");
}

#[test]
fn test_topic_status_needs_attention_mid_recall() {
    assert_eq!(
        derive_topic_status(Some(0.65), Some(0.90)),
        "needs_attention"
    );
}

#[test]
fn test_topic_status_healthy_no_recall() {
    assert_eq!(derive_topic_status(None, Some(0.90)), "healthy");
}

#[test]
fn test_topic_status_healthy_no_accuracy() {
    assert_eq!(derive_topic_status(Some(0.85), None), "healthy");
}

#[test]
fn test_topic_status_healthy_no_metrics() {
    assert_eq!(derive_topic_status(None, None), "healthy");
}

#[test]
fn test_topic_status_critical_low_recall() {
    assert_eq!(derive_topic_status(Some(0.30), Some(0.90)), "critical");
}

#[test]
fn test_topic_status_critical_low_accuracy() {
    assert_eq!(derive_topic_status(Some(0.85), Some(0.20)), "critical");
}

#[test]
fn test_topic_status_boundary_min_healthy() {
    assert_eq!(derive_topic_status(Some(0.70), Some(0.70)), "healthy");
}

#[test]
fn test_topic_status_boundary_needs_attention_low() {
    let status = derive_topic_status(Some(0.69), Some(0.69));
    assert_eq!(status, "needs_attention");
}

#[test]
fn test_topic_status_boundary_needs_attention_high() {
    assert_eq!(
        derive_topic_status(Some(0.50), Some(0.50)),
        "needs_attention"
    );
}

#[test]
fn test_topic_status_boundary_critical() {
    assert_eq!(derive_topic_status(Some(0.49), Some(0.49)), "critical");
}

// ---------------------------------------------------------------------------
// categorize_topic_insights
// ---------------------------------------------------------------------------

fn make_topic(
    name: &str,
    has_video: bool,
    has_quiz: bool,
    avg_recall: Option<f64>,
    practice_accuracy: Option<f64>,
) -> TopicWithMetrics {
    TopicWithMetrics {
        id: Uuid::new_v4(),
        name: name.to_string(),
        chapter_id: Uuid::new_v4(),
        has_video,
        has_quiz,
        avg_recall,
        practice_accuracy,
        last_activity_at: None,
    }
}

#[test]
fn test_topic_insights_weak_recall_warning() {
    let topics = vec![
        make_topic("Topic A", true, true, Some(0.3), Some(0.9)),
        make_topic("Topic B", true, true, Some(0.4), Some(0.85)),
        make_topic("Topic C", true, true, Some(0.9), Some(0.95)),
    ];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.signal_type == "warning"));
    assert!(
        insights
            .iter()
            .any(|i| i.title.contains("weak") || i.title.contains("recall"))
    );
}

#[test]
fn test_topic_insights_low_accuracy_negative() {
    let topics = vec![
        make_topic("Topic A", true, true, Some(0.85), Some(0.3)),
        make_topic("Topic B", true, true, Some(0.9), Some(0.95)),
    ];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.signal_type == "negative"));
}

#[test]
fn test_topic_insights_no_video_warning() {
    let topics = vec![
        make_topic("Topic A", false, true, Some(0.85), Some(0.9)),
        make_topic("Topic B", true, true, Some(0.9), Some(0.95)),
    ];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.title.contains("video")));
}

#[test]
fn test_topic_insights_no_quiz_info() {
    let topics = vec![make_topic("Topic A", true, false, Some(0.85), Some(0.9))];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.title.contains("quiz")));
}

#[test]
fn test_topic_insights_all_fully_equipped_positive() {
    let topics = vec![
        make_topic("Topic A", true, true, Some(0.85), Some(0.9)),
        make_topic("Topic B", true, true, Some(0.9), Some(0.95)),
    ];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.signal_type == "positive"));
}

#[test]
fn test_topic_insights_empty_returns_info() {
    let topics = vec![];
    let insights = categorize_topic_insights(&topics);
    assert!(insights.iter().any(|i| i.signal_type == "info"));
    assert!(insights.iter().any(|i| i.title.contains("data")));
}

#[test]
fn test_topic_insights_deduplicates() {
    let topics = vec![
        make_topic("Topic A", true, false, Some(0.85), Some(0.9)),
        make_topic("Topic B", true, false, Some(0.9), Some(0.95)),
    ];
    let insights = categorize_topic_insights(&topics);
    let quiz_titles: Vec<_> = insights
        .iter()
        .filter(|i| i.title.contains("quiz"))
        .collect();
    assert_eq!(
        quiz_titles.len(),
        1,
        "should deduplicate same-title insights"
    );
}

#[test]
fn test_topic_insights_max_six() {
    let topics = (0..10)
        .map(|i| {
            make_topic(
                &format!("Topic {}", i),
                i % 2 == 0,
                i % 3 == 0,
                Some(0.3),
                Some(0.3),
            )
        })
        .collect::<Vec<_>>();
    let insights = categorize_topic_insights(&topics);
    assert!(insights.len() <= 6, "should limit to 6 insights");
}
