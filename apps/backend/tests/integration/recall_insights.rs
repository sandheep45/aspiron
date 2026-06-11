use axum::body::to_bytes;
use axum::http::StatusCode;
use uuid::Uuid;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_chapter, create_test_completed_recall_session, create_test_recall_answer_variant,
    create_test_subject, create_test_topic, create_test_user,
};
use crate::harness::TestApp;

/// Counter for unique email generation.
static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

async fn create_content_hierarchy(db: &sea_orm::DatabaseConnection, id: &str) -> Uuid {
    let subject = create_test_subject(db, &format!("RiSub{id}"), ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, &format!("RiCh{id}"), 1).await;
    let topic = create_test_topic(db, chapter.id, &format!("RiTopic{id}"), 1).await;
    topic.id
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
// Auth tests — currently, recall insights routes do NOT require auth
// These tests document the current behavior and will be updated if auth
// middleware is added later.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/overview", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn mcq_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/mcq", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn free_recall_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/free-response", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn gaps_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/gaps", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn actions_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/actions", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn trends_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/recall/trends", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/overview
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_defaults_for_unknown_topic() {
    let app = TestApp::new().await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{}/recall/overview", Uuid::new_v4()),
    )
    .await;

    assert_eq!(json["avg_recall_score"], 0.0);
    assert_eq!(json["completion_rate"], 0.0);
    assert_eq!(json["last_recall_run"], "No recall runs");
}

#[tokio::test]
async fn overview_returns_data_with_seeded_sessions() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "OV1").await;
    let user = create_test_user(db, &unique_email("ov1"), "pass", UserTypeEnums::STUDENT).await;

    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    create_test_recall_answer_variant(
        db,
        session.id,
        LearningRecallQuestionTypeEnum::MCQ,
        true,
        Some(85),
    )
    .await;
    create_test_recall_answer_variant(
        db,
        session.id,
        LearningRecallQuestionTypeEnum::MCQ,
        false,
        Some(40),
    )
    .await;

    let (_status, json) =
        get_json(&app, &format!("/api/v1/topics/{topic_id}/recall/overview")).await;

    assert!(json["avg_recall_score"].as_f64().unwrap() > 0.0);
    assert!(json["completion_rate"].as_f64().unwrap() > 0.0);
    assert!(json["last_recall_run"].as_str().unwrap() != "No recall runs");
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/mcq
// ---------------------------------------------------------------------------

#[tokio::test]
async fn mcq_returns_difficulty_breakdown() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "MCQ1").await;
    let user = create_test_user(db, &unique_email("mcq1"), "pass", UserTypeEnums::STUDENT).await;

    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    for i in 0..12 {
        create_test_recall_answer_variant(
            db,
            session.id,
            LearningRecallQuestionTypeEnum::MCQ,
            i % 2 == 0,
            Some(if i % 2 == 0 { 90 } else { 30 }),
        )
        .await;
    }

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{topic_id}/recall/mcq")).await;

    assert!(json["overall_accuracy"].as_f64().unwrap() > 0.0);
    assert_eq!(json["total_questions_attempted"], 12);
    assert!(!json["difficulty_breakdown"].as_array().unwrap().is_empty());
    assert!(!json["questions"].as_array().unwrap().is_empty());
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/free-response
// ---------------------------------------------------------------------------

#[tokio::test]
async fn free_recall_returns_data() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "FR1").await;
    let user = create_test_user(db, &unique_email("fr1"), "pass", UserTypeEnums::STUDENT).await;

    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    for i in 0..6 {
        create_test_recall_answer_variant(
            db,
            session.id,
            LearningRecallQuestionTypeEnum::REFLECTION,
            i % 2 == 0,
            None,
        )
        .await;
    }

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{topic_id}/recall/free-response"),
    )
    .await;

    assert!(json["ai_clarity_score"].as_f64().unwrap() >= 0.0);
    assert!(!json["missing_concepts"].as_array().unwrap().is_empty());
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/gaps
// ---------------------------------------------------------------------------

#[tokio::test]
async fn gaps_returns_items() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "GP1").await;
    let user = create_test_user(db, &unique_email("gp1"), "pass", UserTypeEnums::STUDENT).await;

    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    for i in 0..24 {
        create_test_recall_answer_variant(
            db,
            session.id,
            if i % 2 == 0 {
                LearningRecallQuestionTypeEnum::MCQ
            } else {
                LearningRecallQuestionTypeEnum::REFLECTION
            },
            i % 3 != 0,
            Some(if i % 3 == 0 { 0 } else { 80 }),
        )
        .await;
    }

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{topic_id}/recall/gaps")).await;

    let items = json["items"].as_array().unwrap();
    assert!(!items.is_empty(), "should have gap items");
    assert!(items[0]["recall_status"].as_str().is_some());
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/actions
// ---------------------------------------------------------------------------

#[tokio::test]
async fn actions_returns_fixed_list() {
    let app = TestApp::new().await;

    let (_status, json) = get_json(
        &app,
        &format!("/api/v1/topics/{}/recall/actions", Uuid::new_v4()),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 4);
    assert_eq!(items[0]["id"], "spherical-symmetry");
    assert_eq!(items[1]["id"], "hard-mcq-recall");
}

// ---------------------------------------------------------------------------
// GET /topics/{topic_id}/recall/trends
// ---------------------------------------------------------------------------

#[tokio::test]
async fn trends_returns_null_for_single_session() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "TR1").await;
    let user = create_test_user(db, &unique_email("tr1"), "pass", UserTypeEnums::STUDENT).await;

    create_test_completed_recall_session(db, user.id, topic_id).await;

    let (status, bytes) = {
        let response = app
            .get(&format!("/api/v1/topics/{topic_id}/recall/trends"))
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
async fn trends_returns_data_with_multiple_sessions() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "TR2").await;
    let user = create_test_user(db, &unique_email("tr2"), "pass", UserTypeEnums::STUDENT).await;

    // Create 3 completed recall sessions to satisfy the 2+ requirement
    let s1 = create_test_completed_recall_session(db, user.id, topic_id).await;
    let s2 = create_test_completed_recall_session(db, user.id, topic_id).await;
    let s3 = create_test_completed_recall_session(db, user.id, topic_id).await;

    for s in [&s1, &s2, &s3] {
        create_test_recall_answer_variant(
            db,
            s.id,
            LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(80),
        )
        .await;
        create_test_recall_answer_variant(
            db,
            s.id,
            LearningRecallQuestionTypeEnum::REFLECTION,
            true,
            None,
        )
        .await;
    }

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{topic_id}/recall/trends")).await;

    assert!(json["recall_trend"].as_array().unwrap().len() >= 2);
    assert!(!json["memory_decay_curve"].as_array().unwrap().is_empty());
    assert!(!json["recall_by_difficulty"].as_array().unwrap().is_empty());
    assert!(
        !json["retention_distribution"]
            .as_array()
            .unwrap()
            .is_empty()
    );
}

// ---------------------------------------------------------------------------
// 422 for invalid UUID
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_422_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/topics/invalid-uuid/recall/overview").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn mcq_returns_400_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/topics/invalid-uuid/recall/mcq").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn free_recall_returns_400_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app
        .get("/api/v1/topics/invalid-uuid/recall/free-response")
        .await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn gaps_returns_400_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/topics/invalid-uuid/recall/gaps").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn actions_returns_400_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/topics/invalid-uuid/recall/actions").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn trends_returns_400_for_invalid_uuid() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/topics/invalid-uuid/recall/trends").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}
