use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::EntityTrait;
use uuid::Uuid;

use backend::entries::entities::assessment_question;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_assessment_attempt, create_test_chapter, create_test_quiz, create_test_subject,
    create_test_topic, create_test_user,
};
use crate::harness::TestApp;

/// Counter for unique email generation.
static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

async fn create_content_hierarchy(
    db: &sea_orm::DatabaseConnection,
    subject_name: &str,
    chapter_name: &str,
    topic_name: &str,
) -> Uuid {
    let subject = create_test_subject(db, subject_name, ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, chapter_name, 1).await;
    let topic = create_test_topic(db, chapter.id, topic_name, 1).await;
    topic.id
}

async fn post_json(
    app: &TestApp,
    path: &str,
    body: serde_json::Value,
) -> (StatusCode, serde_json::Value) {
    let response = app.post_json(path, body).await;
    let status = response.status();
    let bytes = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, json)
}

async fn get_json(app: &TestApp, path: &str) -> (StatusCode, serde_json::Value) {
    let response = app.get(path).await;
    let status = response.status();
    let bytes = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, json)
}

// ---------------------------------------------------------------------------
// POST /practice/questions
// ---------------------------------------------------------------------------

#[tokio::test]
async fn create_question_returns_200() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CQ", "CQCh", "CQTopic").await;

    let (status, json) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions"),
        serde_json::json!({
            "question": "What is the derivative of x²?",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "correct_answer": "2x",
        }),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(!json["id"].as_str().unwrap().is_empty());
    assert!(json["identifier"].as_str().unwrap().starts_with("Q-"));
}

#[tokio::test]
async fn create_question_creates_practice_quiz_implicitly() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CQ2", "CQ2Ch", "CQ2Topic").await;

    let (status, _json) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions"),
        serde_json::json!({
            "question": "What is 2+2?",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "correct_answer": "4",
        }),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn create_question_reuses_existing_quiz() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CQ3", "CQ3Ch", "CQ3Topic").await;

    // First question creates a quiz
    let (_status1, _json1) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions"),
        serde_json::json!({
            "question": "Question 1",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "correct_answer": "A",
        }),
    )
    .await;

    // Second question reuses the same quiz
    let (_status2, _json2) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions"),
        serde_json::json!({
            "question": "Question 2",
            "question_type": "Numerical",
            "difficulty": "Hard",
            "correct_answer": "42",
        }),
    )
    .await;

    // Both questions should exist in the DB
    let count = assessment_question::Entity::find()
        .all(db)
        .await
        .expect("query questions")
        .len();
    assert_eq!(count, 2, "should have 2 questions in total");
}

#[tokio::test]
async fn create_question_returns_422_for_empty_body() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CQ4", "CQ4Ch", "CQ4Topic").await;

    // Send an empty JSON object — missing required fields
    let response = app
        .post_json(
            &format!("/api/v1/topics/{topic_id}/practice/questions"),
            serde_json::json!({}),
        )
        .await;
    let status = response.status();

    // Axum returns 422 for JSON deserialization failures (via Json rejections)
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

// ---------------------------------------------------------------------------
// POST /practice/tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn create_test_returns_200() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CT", "CTCh", "CTTopic").await;

    // First create 3 questions
    let quiz_id = create_test_quiz(db, topic_id, "Practice Questions").await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q1", "A", serde_json::Value::Null)
        .await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q2", "B", serde_json::Value::Null)
        .await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q3", "C", serde_json::Value::Null)
        .await;

    // Get question IDs
    let questions = assessment_question::Entity::find()
        .all(db)
        .await
        .expect("query questions");
    let question_ids: Vec<String> = questions.iter().map(|q| q.id.to_string()).collect();

    let (status, json) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/tests"),
        serde_json::json!({
            "title": "Test Assessment",
            "question_ids": question_ids,
        }),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["title"], "Test Assessment");
    assert_eq!(json["questions_count"], 3);
}

#[tokio::test]
async fn create_test_creates_empty_quiz_without_questions() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "CT2", "CT2Ch", "CT2Topic").await;

    let (status, json) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/tests"),
        serde_json::json!({
            "title": "Empty Test",
            "question_ids": [],
        }),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["title"], "Empty Test");
    assert_eq!(json["questions_count"], 0);
}

// ---------------------------------------------------------------------------
// GET /practice/overview
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_defaults_for_unknown_topic() {
    let app = TestApp::new().await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{}/practice/overview", Uuid::new_v4()),
    )
    .await;

    assert_eq!(json["total_questions"], 0);
    assert_eq!(json["total_tests"], 0);
    assert_eq!(json["average_accuracy"], 0.0);
    assert_eq!(json["last_test_conducted"], "No tests conducted");
}

#[tokio::test]
async fn overview_returns_counts_with_seeded_data() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "OV", "OVCh", "OVTopic").await;

    // Seed a quiz with 2 questions and 1 attempt
    let quiz_id = create_test_quiz(db, topic_id, "Overview Quiz").await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q1", "A", serde_json::Value::Null)
        .await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q2", "B", serde_json::Value::Null)
        .await;
    let user = create_test_user(db, &unique_email("ov"), "pass", UserTypeEnums::STUDENT).await;
    create_test_assessment_attempt(db, quiz_id, user.id, 85).await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/overview"),
    )
    .await;

    assert_eq!(json["total_questions"], 2);
    assert_eq!(json["total_tests"], 1);
    let acc = json["average_accuracy"].as_f64().unwrap();
    assert!(
        (acc - 85.0).abs() < 0.01,
        "average_accuracy should be 85, got {acc}"
    );
}

// ---------------------------------------------------------------------------
// GET /practice/questions
// ---------------------------------------------------------------------------

#[tokio::test]
async fn questions_returns_paginated() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "PQ", "PQCh", "PQTopic").await;

    // Seed a quiz with 15 questions
    let quiz_id = create_test_quiz(db, topic_id, "Paginated Quiz").await;
    for i in 0..15 {
        crate::fixtures::helpers::create_test_question(
            db,
            quiz_id,
            &format!("Question {}", i + 1),
            "A",
            serde_json::json!([{"text": "A"}, {"text": "B"}, {"text": "C"}, {"text": "D"}]),
        )
        .await;
    }

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions?page=1&limit=10"),
    )
    .await;

    assert_eq!(json["total"], 15);
    assert_eq!(json["page"], 1);
    assert_eq!(json["limit"], 10);
    assert_eq!(json["total_pages"], 2);
    assert_eq!(json["items"].as_array().unwrap().len(), 10);
}

#[tokio::test]
async fn questions_supports_search() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "QS", "QSCh", "QSTopic").await;

    let quiz_id = create_test_quiz(db, topic_id, "Search Quiz").await;
    crate::fixtures::helpers::create_test_question(
        db,
        quiz_id,
        "Algebra equations",
        "A",
        serde_json::Value::Null,
    )
    .await;
    crate::fixtures::helpers::create_test_question(
        db,
        quiz_id,
        "Geometry theorems",
        "B",
        serde_json::Value::Null,
    )
    .await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions?search=Algebra"),
    )
    .await;

    assert_eq!(json["total"], 1);
}

// ---------------------------------------------------------------------------
// GET /practice/tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn tests_returns_array() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "TT", "TTCh", "TTTopic").await;

    create_test_quiz(db, topic_id, "Test 1").await;
    create_test_quiz(db, topic_id, "Test 2").await;

    let (_status, json) =
        get_json(&app, &format!("/api/v1/topics/{topic_id}/practice/tests")).await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    assert_eq!(items[0]["title"], "Test 1");
    assert_eq!(items[1]["title"], "Test 2");
}

#[tokio::test]
async fn tests_returns_empty_when_no_quizzes() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "TT0", "TT0Ch", "TT0Topic").await;

    let (_status, json) =
        get_json(&app, &format!("/api/v1/topics/{topic_id}/practice/tests")).await;

    let items = json.as_array().unwrap();
    assert!(items.is_empty());
}

// ---------------------------------------------------------------------------
// GET /practice/signals
// ---------------------------------------------------------------------------

#[tokio::test]
async fn signals_returns_array_with_application_based_signal() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "SG", "SGCh", "SGTopic").await;

    let (_status, json) =
        get_json(&app, &format!("/api/v1/topics/{topic_id}/practice/signals")).await;

    let items = json.as_array().unwrap();
    assert!(!items.is_empty(), "should have at least 1 signal");
    let ids: Vec<&str> = items.iter().map(|i| i["id"].as_str().unwrap()).collect();
    assert!(
        ids.contains(&"application-based"),
        "should always have application-based signal"
    );
}

// ---------------------------------------------------------------------------
// GET /practice/analytics
// ---------------------------------------------------------------------------

#[tokio::test]
async fn analytics_returns_null_when_no_attempts() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "AN", "ANCh", "ANTopic").await;

    // Create quiz with questions but no attempts
    let quiz_id = create_test_quiz(db, topic_id, "Analytics Quiz").await;
    crate::fixtures::helpers::create_test_question(db, quiz_id, "Q1", "A", serde_json::Value::Null)
        .await;

    let (status, bytes) = {
        let response = app
            .get(&format!("/api/v1/topics/{topic_id}/practice/analytics"))
            .await;
        let status = response.status();
        let bytes = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("read body");
        (status, bytes)
    };

    assert_eq!(status, StatusCode::OK);
    assert_eq!(&bytes[..], b"null");
}

#[tokio::test]
async fn analytics_returns_data_with_attempts() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "AN2", "AN2Ch", "AN2Topic").await;

    let quiz_id = create_test_quiz(db, topic_id, "Analytics Quiz 2").await;
    let user = create_test_user(db, &unique_email("an2"), "pass", UserTypeEnums::STUDENT).await;
    create_test_assessment_attempt(db, quiz_id, user.id, 80).await;
    create_test_assessment_attempt(db, quiz_id, user.id, 90).await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/analytics"),
    )
    .await;

    assert!(
        !json.is_null(),
        "analytics should not be null with attempts"
    );
    assert!(!json["average_score_trend"].as_array().unwrap().is_empty());
    assert!(
        !json["difficulty_distribution"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    assert_eq!(json["attempts_trend"].as_array().unwrap().len(), 1);
}

// ---------------------------------------------------------------------------
// Auth behavior
// ---------------------------------------------------------------------------

#[tokio::test]
async fn create_question_works_without_auth() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "AUTH", "AUTHCh", "AUTHTopic").await;

    let (status, _json) = post_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/practice/questions"),
        serde_json::json!({
            "question": "No auth question",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "correct_answer": "A",
        }),
    )
    .await;

    assert_eq!(
        status,
        StatusCode::OK,
        "content routes should not require auth"
    );
}
