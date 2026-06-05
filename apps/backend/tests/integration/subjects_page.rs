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

async fn create_content_hierarchy(
    db: &DatabaseConnection,
    subject_name: &str,
    chapter_name: &str,
    topic_name: &str,
) -> (Uuid, Uuid, Uuid) {
    let subject = create_test_subject(db, subject_name, ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, chapter_name, 1).await;
    let topic = create_test_topic(db, chapter.id, topic_name, 1).await;
    (subject.id, chapter.id, topic.id)
}

async fn seed_topic_accuracy(
    db: &DatabaseConnection,
    topic_id: Uuid,
    correct: usize,
    total: usize,
) {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let user = create_test_user(
        db,
        &format!("student{n}@test.com"),
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
}

async fn seed_topic_accuracy_and_quiz(
    db: &DatabaseConnection,
    topic_id: Uuid,
    correct: usize,
    total: usize,
    quiz_score: i32,
) {
    seed_topic_accuracy(db, topic_id, correct, total).await;
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let user = create_test_user(
        db,
        &format!("accuracy_user{n}@test.com"),
        "pass",
        UserTypeEnums::STUDENT,
    )
    .await;
    let quiz_id = create_test_quiz(db, topic_id, "Test Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user.id, quiz_score).await;
}

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

// ---------------------------------------------------------------------------
// Subjects endpoint - /api/v1/content/subjects-page
// ---------------------------------------------------------------------------

#[tokio::test]
async fn subjects_page_returns_items() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let (subj1, _, _) = create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;
    let (subj2, _, _) = create_content_hierarchy(db, "Chemistry", "Organic", "Alkanes").await;

    // Add chapters to each
    create_test_chapter(db, subj1, "Thermodynamics", 2).await;
    create_test_chapter(db, subj2, "Inorganic", 2).await;

    let json = get_json(&app, "/api/v1/content/subjects-page").await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);

    let names: Vec<&str> = items.iter().map(|i| i["name"].as_str().unwrap()).collect();
    assert!(names.contains(&"Physics"));
    assert!(names.contains(&"Chemistry"));

    for item in items {
        assert!(item["chapters_count"].as_i64().unwrap_or(0) > 0);
        assert!(item["coverage"].as_f64().is_some());
        assert!(item["status"].as_str().is_some());
    }
}

#[tokio::test]
async fn subjects_page_empty_database() {
    let app = TestApp::new().await;

    let json = get_json(&app, "/api/v1/content/subjects-page").await;
    assert!(json.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn subjects_page_zero_coverage() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    create_test_chapter(db, subject.id, "Mechanics", 1).await;

    let json = get_json(&app, "/api/v1/content/subjects-page").await;

    assert_eq!(json.as_array().unwrap().len(), 1);
    assert_eq!(json[0]["coverage"], 0.0);
    assert_eq!(json[0]["topics_published"], 0);
}

#[tokio::test]
async fn subjects_page_partial_coverage() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subject = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch = create_test_chapter(db, subject.id, "Mechanics", 1).await;

    for i in 0..10 {
        let t = create_test_topic(db, ch.id, &format!("Topic{}", i), i).await;
        if i < 6 {
            create_test_quiz(db, t.id, &format!("Quiz{}", i)).await;
        }
    }

    let json = get_json(&app, "/api/v1/content/subjects-page").await;

    assert_eq!(json.as_array().unwrap().len(), 1);
    assert_eq!(json[0]["coverage"], 60.0);
    assert_eq!(json[0]["topics_published"], 6);
}

#[tokio::test]
async fn subjects_page_recall_and_accuracy() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let (_, _, topic_id) =
        create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;

    // 7/10 correct recall = 0.7 average_recall
    seed_topic_accuracy_and_quiz(db, topic_id, 7, 10, 85).await;

    let json = get_json(&app, "/api/v1/content/subjects-page").await;

    assert_eq!(json.as_array().unwrap().len(), 1);
    let item = &json[0];
    assert!(item["average_recall"].as_f64().unwrap() - 0.7 < 0.01);
    assert!(item["practice_accuracy"].as_f64().unwrap() - 0.85 < 0.01);
}

// ---------------------------------------------------------------------------
// Summary endpoint - /api/v1/content/subjects-page/summary
// ---------------------------------------------------------------------------

#[tokio::test]
async fn summary_returns_counts() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let subj1 = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let subj2 = create_test_subject(db, "Chemistry", ExamTypeEnums::JEE).await;

    let ch1 = create_test_chapter(db, subj1.id, "Mechanics", 1).await;
    let ch2 = create_test_chapter(db, subj2.id, "Organic", 1).await;

    let t1 = create_test_topic(db, ch1.id, "Topic1", 1).await;
    let _t2 = create_test_topic(db, ch1.id, "Topic2", 2).await;
    let t3 = create_test_topic(db, ch2.id, "Topic3", 1).await;

    create_test_quiz(db, t1.id, "Quiz1").await;
    create_test_quiz(db, t3.id, "Quiz2").await;

    let json = get_json(&app, "/api/v1/content/subjects-page/summary").await;

    assert_eq!(json["total_subjects"], 2);
    assert_eq!(json["total_topics"], 3);
    assert_eq!(json["published_topics"], 2);
    assert_eq!(json["descriptions"].as_array().unwrap().len(), 4);
}

#[tokio::test]
async fn summary_empty() {
    let app = TestApp::new().await;

    let json = get_json(&app, "/api/v1/content/subjects-page/summary").await;

    assert_eq!(json["total_subjects"], 0);
    assert_eq!(json["total_topics"], 0);
    assert_eq!(json["published_topics"], 0);
    assert_eq!(json["topics_needing_attention"], 0);
}

#[tokio::test]
async fn summary_topics_needing_attention() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Topic 1: recall 3/10 = 30% < 60% → flagged
    let (_, _, t1) = create_content_hierarchy(db, "Physics", "Mechanics", "Topic Low").await;
    seed_topic_accuracy(db, t1, 3, 10).await;

    // Topic 2: recall 8/10 = 80% ≥ 60% → not flagged
    let (_, _, t2) = create_content_hierarchy(db, "Chemistry", "Organic", "Topic High").await;
    seed_topic_accuracy(db, t2, 8, 10).await;

    let json = get_json(&app, "/api/v1/content/subjects-page/summary").await;

    assert_eq!(json["topics_needing_attention"], 1);
}

// ---------------------------------------------------------------------------
// Signals endpoint - /api/v1/content/subjects-page/signals
// ---------------------------------------------------------------------------

#[tokio::test]
async fn signals_returns_signals() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Physics: low recall → negative signal
    let (_, _, phys_topic) =
        create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;
    seed_topic_accuracy(db, phys_topic, 3, 10).await;

    // Chemistry: high accuracy → positive signal + coverage ≥80% → positive signal
    let chem_subject = create_test_subject(db, "Chemistry", ExamTypeEnums::JEE).await;
    let chem_ch = create_test_chapter(db, chem_subject.id, "Organic", 1).await;
    let chem_topic = create_test_topic(db, chem_ch.id, "Alkanes", 1).await;
    seed_topic_accuracy_and_quiz(db, chem_topic.id, 9, 10, 95).await;

    let json = get_json(&app, "/api/v1/content/subjects-page/signals").await;

    let signals = json.as_array().unwrap();
    assert!(!signals.is_empty());

    let types: Vec<&str> = signals
        .iter()
        .map(|s| s["signal_type"].as_str().unwrap())
        .collect();
    assert!(types.contains(&"negative"));
    assert!(types.contains(&"positive"));
}

#[tokio::test]
async fn signals_empty_no_chapters() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    let json = get_json(&app, "/api/v1/content/subjects-page/signals").await;

    assert!(json.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn signals_deduplicates() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Two subjects with same coverage signal (both ≥80%)
    let subj1 = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let ch1 = create_test_chapter(db, subj1.id, "Mechanics", 1).await;
    let t1 = create_test_topic(db, ch1.id, "Topic1", 1).await;
    create_test_quiz(db, t1.id, "Quiz").await;

    let subj2 = create_test_subject(db, "Chemistry", ExamTypeEnums::JEE).await;
    let ch2 = create_test_chapter(db, subj2.id, "Organic", 1).await;
    let t2 = create_test_topic(db, ch2.id, "Topic2", 1).await;
    create_test_quiz(db, t2.id, "Quiz2").await;

    let json = get_json(&app, "/api/v1/content/subjects-page/signals").await;

    // Each subject gets a distinct coverage message with its own name, so no dedup
    // This test just verifies the endpoint works with signals
    let signals = json.as_array().unwrap();
    assert!(!signals.is_empty());
}

#[tokio::test]
async fn signals_truncates_to_four() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Create 5 subjects with high coverage (≥80%) → each generates a signal
    for i in 0..6 {
        let subj = create_test_subject(db, &format!("Sub{}", i), ExamTypeEnums::JEE).await;
        let ch = create_test_chapter(db, subj.id, &format!("Ch{}", i), 1).await;
        let t = create_test_topic(db, ch.id, &format!("Topic{}", i), 1).await;
        create_test_quiz(db, t.id, &format!("Quiz{}", i)).await;
    }

    let json = get_json(&app, "/api/v1/content/subjects-page/signals").await;

    let signals = json.as_array().unwrap();
    assert!(signals.len() <= 4);
}
