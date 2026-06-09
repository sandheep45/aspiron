use axum::body::to_bytes;
use axum::http::StatusCode;

use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use uuid::Uuid;

use backend::entries::entities::content_video;
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

/// Create a test video record for a topic.
async fn create_test_video(db: &DatabaseConnection, topic_id: Uuid) {
    let id = Uuid::new_v4();
    let model = content_video::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        transcript: Set(None),
        title: Set("Test Video".to_string()),
        duration_seconds: Set(600),
        video_url: Set("https://example.com/video".to_string()),
    };
    model.insert(db).await.expect("insert test video");
}

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
        &format!("tp_recall_user{n}@test.com"),
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
// Summary endpoint — /api/v1/chapters/{id}/topics-page/summary
// ---------------------------------------------------------------------------

#[tokio::test]
async fn summary_returns_chapter_name_and_metrics() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    // 2 topics
    let t1 = create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;
    let t2 = create_test_topic(db, chapter.id, "Electric Field", 2).await;

    // t1 has quiz → published
    create_test_quiz(db, t1.id, "Quiz1").await;
    // t2 has video + quiz → published
    create_test_video(db, t2.id).await;
    create_test_quiz(db, t2.id, "Quiz2").await;

    // weak recall on t1
    seed_recall(db, t1.id, 2, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/summary", chapter.id),
    )
    .await;

    assert_eq!(json["chapter_name"], "Electrostatics");
    assert_eq!(json["total_topics"], 2);
    assert_eq!(json["published_topics"], 2);
    assert_eq!(json["draft_topics"], 0);
    assert_eq!(json["weak_topics"], 1);
}

#[tokio::test]
async fn summary_returns_404_for_unknown_chapter() {
    let app = TestApp::new().await;

    let status = get_status(
        &app,
        "/api/v1/chapters/00000000-0000-0000-0000-000000000000/topics-page/summary",
    )
    .await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn summary_with_no_topics() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Empty Chapter", 1).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/summary", chapter.id),
    )
    .await;

    assert_eq!(json["chapter_name"], "Empty Chapter");
    assert_eq!(json["total_topics"], 0);
    assert_eq!(json["published_topics"], 0);
    assert_eq!(json["draft_topics"], 0);
    assert_eq!(json["weak_topics"], 0);
}

// ---------------------------------------------------------------------------
// Topics endpoint — /api/v1/chapters/{id}/topics-page/topics
// ---------------------------------------------------------------------------

#[tokio::test]
async fn topics_returns_all_without_params() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;
    create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;
    create_test_topic(db, chapter.id, "Electric Field", 2).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/topics", chapter.id),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
}

#[tokio::test]
async fn topics_search_filters_by_name() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;
    create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;
    create_test_topic(db, chapter.id, "Electric Field", 2).await;
    create_test_topic(db, chapter.id, "Gauss Law", 3).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?search=Gauss",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Gauss Law");
}

#[tokio::test]
async fn topics_search_case_insensitive() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;
    create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?search=coulomb",
            chapter.id
        ),
    )
    .await;

    assert_eq!(json.as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn topics_content_status_filter() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    // published: has video + quiz
    let t1 = create_test_topic(db, chapter.id, "Published Topic", 1).await;
    create_test_video(db, t1.id).await;
    create_test_quiz(db, t1.id, "Q1").await;

    // draft: quiz only
    let _t2 = create_test_topic(db, chapter.id, "Draft Topic", 2).await;
    create_test_quiz(db, _t2.id, "Q2").await;

    // archived: neither
    let _t3 = create_test_topic(db, chapter.id, "Archived Topic", 3).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?content_status_filter=published",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["content_status"], "published");
}

#[tokio::test]
async fn topics_video_filter() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    let t1 = create_test_topic(db, chapter.id, "Has Video", 1).await;
    create_test_video(db, t1.id).await;

    let _t2 = create_test_topic(db, chapter.id, "No Video", 2).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?video_filter=true",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["video_available"], true);
}

#[tokio::test]
async fn topics_recall_filter() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    // weak recall: 2/10 = 20% → < 50%
    let t1 = create_test_topic(db, chapter.id, "Weak Recall", 1).await;
    seed_recall(db, t1.id, 2, 10).await;
    create_test_quiz(db, t1.id, "Q1").await;

    // strong recall: 9/10 = 90% → >= 80%
    let t2 = create_test_topic(db, chapter.id, "Strong Recall", 2).await;
    seed_recall(db, t2.id, 9, 10).await;
    create_test_quiz(db, t2.id, "Q2").await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?recall_filter=weak",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["recall_strength"], "weak");
}

#[tokio::test]
async fn topics_sort_by_accuracy_asc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    let t1 = create_test_topic(db, chapter.id, "Low Accuracy", 1).await;
    seed_recall_and_accuracy(db, t1.id, 5, 10, 30).await; // accuracy 30
    create_test_video(db, t1.id).await;

    let t2 = create_test_topic(db, chapter.id, "High Accuracy", 2).await;
    seed_recall_and_accuracy(db, t2.id, 5, 10, 90).await; // accuracy 90
    create_test_video(db, t2.id).await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?sort_by=accuracy&sort_order=asc",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2, "expected 2 items, got {}", items.len());
    let acc0 = items[0]["practice_accuracy"].as_f64().unwrap();
    let acc1 = items[1]["practice_accuracy"].as_f64().unwrap();
    assert!(acc0 < acc1, "expected {} < {} for asc sort", acc0, acc1);
    assert_eq!(items[0]["name"], "Low Accuracy");
    assert_eq!(items[1]["name"], "High Accuracy");
}

#[tokio::test]
async fn topics_sort_by_recall_desc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    let t1 = create_test_topic(db, chapter.id, "Weak Recall", 1).await;
    seed_recall(db, t1.id, 2, 10).await; // 20% recall
    create_test_quiz(db, t1.id, "Q1").await;

    let t2 = create_test_topic(db, chapter.id, "Strong Recall", 2).await;
    seed_recall(db, t2.id, 9, 10).await; // 90% recall
    create_test_quiz(db, t2.id, "Q2").await;

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?sort_by=recall&sort_order=desc",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    assert_eq!(items[0]["recall_strength"], "strong");
    assert_eq!(items[1]["recall_strength"], "weak");
}

#[tokio::test]
async fn topics_pagination() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    for i in 0..5 {
        create_test_topic(db, chapter.id, &format!("Topic {}", i + 1), i + 1).await;
    }

    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?page=1&limit=2",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2, "should return 2 items on page 1");
}

#[tokio::test]
async fn topics_empty_for_unknown_chapter() {
    let app = TestApp::new().await;

    let json = get_json(
        &app,
        "/api/v1/chapters/00000000-0000-0000-0000-000000000000/topics-page/topics",
    )
    .await;

    let items = json.as_array().unwrap();
    assert!(items.is_empty());
}

// ---------------------------------------------------------------------------
// Insights endpoint — /api/v1/chapters/{id}/topics-page/insights
// ---------------------------------------------------------------------------

#[tokio::test]
async fn insights_returns_signal_data() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    // 2 published topics
    let t1 = create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;
    create_test_video(db, t1.id).await;
    create_test_quiz(db, t1.id, "Q1").await;

    let t2 = create_test_topic(db, chapter.id, "Electric Field", 2).await;
    create_test_video(db, t2.id).await;
    create_test_quiz(db, t2.id, "Q2").await;

    // One topic with weak recall → warning
    seed_recall(db, t1.id, 1, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;

    let items = json.as_array().unwrap();
    assert!(
        !items.is_empty(),
        "should return at least one insight (got 0)"
    );
    let types: Vec<&str> = items
        .iter()
        .map(|i| i["type"].as_str().unwrap_or("?"))
        .collect();
    assert!(
        items.iter().any(|i| i["type"] == "warning"),
        "expected a warning signal, got types: {:?}",
        types
    );
}

#[tokio::test]
async fn insights_positive_when_all_healthy() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    // 2 fully-equipped topics with good recall
    let t1 = create_test_topic(db, chapter.id, "Topic A", 1).await;
    create_test_video(db, t1.id).await;
    create_test_quiz(db, t1.id, "Q1").await;
    seed_recall(db, t1.id, 9, 10).await;
    let t2 = create_test_topic(db, chapter.id, "Topic B", 2).await;
    create_test_video(db, t2.id).await;
    create_test_quiz(db, t2.id, "Q2").await;
    seed_recall(db, t2.id, 8, 10).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;

    let items = json.as_array().unwrap();
    let types: Vec<&str> = items
        .iter()
        .map(|i| i["type"].as_str().unwrap_or("?"))
        .collect();
    assert!(
        items.iter().any(|i| i["type"] == "positive"),
        "expected a positive signal, got types: {:?}",
        types
    );
}

#[tokio::test]
async fn insights_info_when_no_topics() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Empty", 1).await;

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;

    let items = json.as_array().unwrap();
    assert!(!items.is_empty());
}

#[tokio::test]
async fn insights_no_more_than_six() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Big Chapter", 1).await;

    // Create many topics with various issues to trigger multiple insights
    for i in 0..8 {
        let topic = create_test_topic(db, chapter.id, &format!("Topic {}", i), i + 1).await;
        if i % 2 == 0 {
            create_test_video(db, topic.id).await;
        }
        if i % 3 == 0 {
            create_test_quiz(db, topic.id, &format!("Q{}", i)).await;
        }
        if i < 4 {
            seed_recall(db, topic.id, 2, 10).await;
        }
    }

    let json = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;

    let items = json.as_array().unwrap();
    assert!(
        items.len() <= 6,
        "should limit to at most 6 insights, got {}",
        items.len()
    );
}

// ---------------------------------------------------------------------------
// Combined search + sort
// ---------------------------------------------------------------------------

#[tokio::test]
async fn topics_search_and_sort_together() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, "Electrostatics", 1).await;

    let t1 = create_test_topic(db, chapter.id, "Alpha", 1).await;
    create_test_video(db, t1.id).await;
    seed_recall_and_accuracy(db, t1.id, 2, 10, 30).await;

    let t2 = create_test_topic(db, chapter.id, "Beta", 2).await;
    create_test_video(db, t2.id).await;
    seed_recall_and_accuracy(db, t2.id, 9, 10, 90).await;

    // Only Beta should match search
    let json = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?search=beta&sort_by=accuracy&sort_order=desc",
            chapter.id
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Beta");
}
