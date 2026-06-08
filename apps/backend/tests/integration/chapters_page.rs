use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_assessment_attempt, create_test_chapter, create_test_completed_recall_session,
    create_test_quiz, create_test_recall_answer_variant, create_test_subject, create_test_topic,
    create_test_user,
};
use crate::harness::TestApp;

static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

/// Seed recall data: creates a student, completed recall session, and answer variants.
async fn seed_recall(
    db: &DatabaseConnection,
    topic_id: Uuid,
    correct: usize,
    total: usize,
) -> Uuid {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let user = create_test_user(
        db,
        &format!("recall_user{n}@test.com"),
        "pass",
        UserTypeEnums::STUDENT,
    )
    .await;
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    for i in 0..total {
        create_test_recall_answer_variant(
            db,
            session.id,
            LearningRecallQuestionTypeEnum::MCQ,
            i < correct,
            Some(if i < correct { 1 } else { 0 }),
        )
        .await;
    }
    user.id
}

/// Seed both recall data and an assessment attempt (for practice_accuracy).
async fn seed_recall_and_accuracy(
    db: &DatabaseConnection,
    topic_id: Uuid,
    correct: usize,
    total: usize,
    quiz_score: i32,
) {
    let user_id = seed_recall(db, topic_id, correct, total).await;
    let quiz_id = create_test_quiz(db, topic_id, "Test Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user_id, quiz_score).await;
}

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

async fn get_status(app: &TestApp, path: &str) -> StatusCode {
    app.get(path).await.status()
}

// ---------------------------------------------------------------------------
// Summary endpoint — /api/v1/subjects/{id}/chapters-page/summary
// ---------------------------------------------------------------------------

#[tokio::test]
async fn summary_returns_subject_name_and_metrics() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch1 = create_test_chapter(db, subject.id, "Mechanics", 1).await;
    let ch2 = create_test_chapter(db, subject.id, "Thermodynamics", 2).await;
    let ch3 = create_test_chapter(db, subject.id, "Optics", 3).await;

    // ch1: 2 topics, 1 published (has quiz)
    let t1 = create_test_topic(db, ch1.id, "Topic1", 1).await;
    let _t2 = create_test_topic(db, ch1.id, "Topic2", 2).await;
    create_test_quiz(db, t1.id, "Quiz1").await;

    // ch2: 1 topic, published
    let t3 = create_test_topic(db, ch2.id, "Topic3", 1).await;
    create_test_quiz(db, t3.id, "Quiz2").await;

    // ch3: 1 topic, not published
    let _t4 = create_test_topic(db, ch3.id, "Topic4", 1).await;

    // Seed low recall on ch1 topic → triggers chapters_needing_attention
    seed_recall(db, t1.id, 2, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/summary", subject.id),
    )
    .await;

    assert_eq!(json["subject_name"], "Physics");
    assert_eq!(json["total_chapters"], 3);
    assert_eq!(json["published_topics"], 2);
    assert_eq!(json["draft_topics"], 2);
    assert_eq!(json["chapters_needing_attention"], 1);
}

#[tokio::test]
async fn summary_returns_404_for_unknown_subject() {
    let app = TestApp::new().await;

    let status = get_status(
        &app,
        "/api/v1/subjects/00000000-0000-0000-0000-000000000000/chapters-page/summary",
    )
    .await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn summary_with_no_chapters() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/summary", subject.id),
    )
    .await;

    assert_eq!(json["subject_name"], "Physics");
    assert_eq!(json["total_chapters"], 0);
    assert_eq!(json["published_topics"], 0);
    assert_eq!(json["draft_topics"], 0);
    assert_eq!(json["chapters_needing_attention"], 0);
}

// ---------------------------------------------------------------------------
// Chapters endpoint — /api/v1/subjects/{id}/chapters-page/chapters
// ---------------------------------------------------------------------------

#[tokio::test]
async fn chapters_returns_all_without_params() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    create_test_chapter(db, subject.id, "Mechanics", 1).await;
    create_test_chapter(db, subject.id, "Thermodynamics", 2).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/chapters", subject.id),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
}

#[tokio::test]
async fn chapters_search_filters_by_name() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    create_test_chapter(db, subject.id, "Mechanics", 1).await;
    create_test_chapter(db, subject.id, "Thermodynamics", 2).await;
    create_test_chapter(db, subject.id, "Electromagnetism", 3).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?search=Mech",
            subject.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Mechanics");
}

#[tokio::test]
async fn chapters_search_case_insensitive() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    create_test_chapter(db, subject.id, "Thermodynamics", 1).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?search=thermo",
            subject.id
        ),
    )
    .await;

    assert_eq!(json.as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn chapters_sort_by_coverage_asc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch1 = create_test_chapter(db, subject.id, "Low Coverage", 1).await;
    let ch2 = create_test_chapter(db, subject.id, "High Coverage", 2).await;

    // ch1: 1 topic, no quiz → 0% coverage
    create_test_topic(db, ch1.id, "T1", 1).await;

    // ch2: 1 topic, has quiz → 100% coverage
    let t = create_test_topic(db, ch2.id, "T2", 1).await;
    create_test_quiz(db, t.id, "Q").await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?sort_by=coverage&sort_order=asc",
            subject.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    assert_eq!(items[0]["name"], "Low Coverage");
    assert_eq!(items[0]["coverage"], 0.0);
    assert_eq!(items[1]["name"], "High Coverage");
    assert!(items[1]["coverage"].as_f64().unwrap() > 0.0);
}

#[tokio::test]
async fn chapters_sort_by_recall_desc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch1 = create_test_chapter(db, subject.id, "Low Recall", 1).await;
    let ch2 = create_test_chapter(db, subject.id, "High Recall", 2).await;

    let t1 = create_test_topic(db, ch1.id, "T1", 1).await;
    let t2 = create_test_topic(db, ch2.id, "T2", 1).await;
    create_test_quiz(db, t1.id, "Q1").await;
    create_test_quiz(db, t2.id, "Q2").await;

    seed_recall(db, t1.id, 3, 10).await; // 30% → weak
    seed_recall(db, t2.id, 9, 10).await; // 90% → strong

    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?sort_by=recall&sort_order=desc",
            subject.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    assert_eq!(items[0]["name"], "High Recall");
    assert_eq!(items[1]["name"], "Low Recall");
}

#[tokio::test]
async fn chapters_sort_by_accuracy_desc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch1 = create_test_chapter(db, subject.id, "Low Accuracy", 1).await;
    let ch2 = create_test_chapter(db, subject.id, "High Accuracy", 2).await;

    let t1 = create_test_topic(db, ch1.id, "T1", 1).await;
    let t2 = create_test_topic(db, ch2.id, "T2", 1).await;

    seed_recall_and_accuracy(db, t1.id, 5, 10, 30).await; // accuracy 30
    seed_recall_and_accuracy(db, t2.id, 5, 10, 90).await; // accuracy 90

    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?sort_by=accuracy&sort_order=desc",
            subject.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    assert_eq!(items[0]["name"], "High Accuracy");
    assert_eq!(items[1]["name"], "Low Accuracy");
}

#[tokio::test]
async fn chapters_sort_by_status() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch_healthy = create_test_chapter(db, subject.id, "Healthy", 1).await;
    let ch_critical = create_test_chapter(db, subject.id, "Critical", 2).await;

    // Healthy: high recall
    let t1 = create_test_topic(db, ch_healthy.id, "T1", 1).await;
    create_test_quiz(db, t1.id, "Q1").await;
    seed_recall(db, t1.id, 9, 10).await;

    // Critical: very low recall
    let t2 = create_test_topic(db, ch_critical.id, "T2", 1).await;
    create_test_quiz(db, t2.id, "Q2").await;
    seed_recall(db, t2.id, 1, 10).await;

    // Sort asc puts critical first (status_sort_key: critical=1, healthy=3)
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?sort_by=status&sort_order=asc",
            subject.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items[0]["name"], "Critical");
    assert_eq!(items[1]["name"], "Healthy");
}

#[tokio::test]
async fn chapters_pagination() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    for i in 1..=5 {
        create_test_chapter(db, subject.id, &format!("Ch{}", i), i).await;
    }

    // Page 1, limit 2
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?page=1&limit=2",
            subject.id
        ),
    )
    .await;

    assert_eq!(json.as_array().unwrap().len(), 2);

    // Page 2, limit 2
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?page=2&limit=2",
            subject.id
        ),
    )
    .await;

    assert_eq!(json.as_array().unwrap().len(), 2);

    // Page 3 (last), limit 2
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?page=3&limit=2",
            subject.id
        ),
    )
    .await;

    assert_eq!(json.as_array().unwrap().len(), 1);

    // Page beyond total → empty
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{}/chapters-page/chapters?page=10&limit=2",
            subject.id
        ),
    )
    .await;

    assert!(json.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn chapters_empty_for_subject_with_no_chapters() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/chapters", subject.id),
    )
    .await;

    assert!(json.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn chapters_endpoint_shows_coverage_status_and_recall() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch = create_test_chapter(db, subject.id, "Mechanics", 1).await;
    let t = create_test_topic(db, ch.id, "Newton's Laws", 1).await;
    create_test_quiz(db, t.id, "Quiz").await;
    seed_recall(db, t.id, 8, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/chapters", subject.id),
    )
    .await;

    let item = &json.as_array().unwrap()[0];
    assert_eq!(item["name"], "Mechanics");
    assert!(item["coverage"].as_f64().unwrap() > 0.0);
    assert_eq!(item["avg_recall"], "strong");
    assert_eq!(item["status"], "healthy");
    assert!(item["total_topics"].as_i64().unwrap() > 0);
    assert!(item["published_topics"].as_i64().unwrap() > 0);
    assert!(!item["last_updated"].as_str().unwrap().is_empty());
}

// ---------------------------------------------------------------------------
// Insights endpoint — /api/v1/subjects/{id}/chapters-page/insights
// ---------------------------------------------------------------------------

#[tokio::test]
async fn insights_returns_signals() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    // Low recall chapter → generates a signal
    let ch1 = create_test_chapter(db, subject.id, "Mechanics", 1).await;
    let t1 = create_test_topic(db, ch1.id, "T1", 1).await;
    create_test_quiz(db, t1.id, "Q1").await;
    seed_recall(db, t1.id, 2, 10).await;

    // High recall chapter → generates a different signal
    let ch2 = create_test_chapter(db, subject.id, "Thermodynamics", 2).await;
    let t2 = create_test_topic(db, ch2.id, "T2", 1).await;
    create_test_quiz(db, t2.id, "Q2").await;
    seed_recall(db, t2.id, 9, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/insights", subject.id),
    )
    .await;

    let signals = json.as_array().unwrap();
    assert!(!signals.is_empty());

    let titles: Vec<&str> = signals
        .iter()
        .map(|s| s["title"].as_str().unwrap())
        .collect();
    assert!(!titles.is_empty());
}

#[tokio::test]
async fn insights_returns_no_data_signal_when_no_chapters() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/insights", subject.id),
    )
    .await;

    let signals = json.as_array().unwrap();
    assert!(!signals.is_empty());
    let ids: Vec<&str> = signals.iter().map(|s| s["id"].as_str().unwrap()).collect();
    assert!(ids.contains(&"no-data"));
}

#[tokio::test]
async fn insights_returns_well_covered_signal_when_all_healthy() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch = create_test_chapter(db, subject.id, "Mechanics", 1).await;
    let t = create_test_topic(db, ch.id, "T1", 1).await;
    create_test_quiz(db, t.id, "Q1").await;
    seed_recall(db, t.id, 10, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/subjects/{}/chapters-page/insights", subject.id),
    )
    .await;

    let signals = json.as_array().unwrap();
    assert!(!signals.is_empty());
    let titles: Vec<&str> = signals
        .iter()
        .map(|s| s["title"].as_str().unwrap())
        .collect();
    assert!(titles.contains(&"All chapters well-covered"));
}
