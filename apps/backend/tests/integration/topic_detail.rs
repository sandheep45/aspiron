use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use uuid::Uuid;

use backend::entries::entities::{content_video, learning_recall_session};
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_assessment_attempt, create_test_chapter, create_test_completed_recall_session,
    create_test_learning_progress, create_test_quiz, create_test_recall_answer_variant,
    create_test_subject, create_test_topic, create_test_user,
};
use crate::harness::TestApp;

/// Counter for unique email generation.
static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

async fn create_content_hierarchy(
    db: &DatabaseConnection,
    subject_name: &str,
    chapter_name: &str,
    topic_name: &str,
) -> Uuid {
    let subject = create_test_subject(
        db,
        subject_name,
        backend::entries::entity_enums::exam_types::ExamTypeEnums::JEE,
    )
    .await;
    let chapter = create_test_chapter(db, subject.id, chapter_name, 1).await;
    let topic = create_test_topic(db, chapter.id, topic_name, 1).await;
    topic.id
}

async fn create_video(db: &DatabaseConnection, topic_id: Uuid) {
    content_video::ActiveModel {
        id: Set(Uuid::new_v4()),
        topic_id: Set(topic_id),
        title: Set("Test Video".to_string()),
        duration_seconds: Set(600),
        video_url: Set("https://example.com/video".to_string()),
        transcript: Set(None),
    }
    .insert(db)
    .await
    .expect("insert video");
}

async fn create_incomplete_recall_session(
    db: &DatabaseConnection,
    user_id: Uuid,
    topic_id: Uuid,
) -> Uuid {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();
    learning_recall_session::ActiveModel {
        id: Set(id),
        user_id: Set(user_id),
        topic_id: Set(topic_id),
        status: Set(LearningRecallSessionStatusEnum::PENDING),
        started_at: Set(now),
        completed_at: Set(None),
    }
    .insert(db)
    .await
    .expect("insert incomplete recall session");
    id
}

/// Creates recall answers in the given session.
async fn seed_recall_answers(
    db: &DatabaseConnection,
    session_id: Uuid,
    correct: usize,
    total: usize,
) {
    for i in 0..total {
        create_test_recall_answer_variant(
            db,
            session_id,
            LearningRecallQuestionTypeEnum::MCQ,
            i < correct,
            Some(if i < correct { 1 } else { 0 }),
        )
        .await;
    }
}

async fn get_json(app: &TestApp, path: &str) -> (StatusCode, serde_json::Value) {
    let response = app.get(path).await;
    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    (status, json)
}

async fn get_raw(app: &TestApp, path: &str) -> (StatusCode, Vec<u8>) {
    let response = app.get(path).await;
    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body")
        .to_vec();
    (status, body)
}

// ---------------------------------------------------------------------------
// Auth tests — currently, content routes do NOT require auth
// These tests document the current behavior and will be updated if auth
// middleware is added later.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/overview", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn issues_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/issues", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn components_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/components", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn actions_returns_200_without_auth() {
    let (status, _json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/actions", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn trends_returns_200_without_auth() {
    let (status, _body) = get_raw(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/trends", Uuid::new_v4()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

// ---------------------------------------------------------------------------
// Overview endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_computed_values() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;
    let user = create_test_user(db, &unique_email("ov"), "pass", UserTypeEnums::ADMIN).await;

    // Seed 10 recall answers (7 correct → strong)
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    seed_recall_answers(db, session.id, 7, 10).await;

    // 3 incomplete sessions + 7 completed → 10 total, 7 completed (rate=0.7 → low dropoff)
    for _ in 0..3 {
        create_incomplete_recall_session(db, user.id, topic_id).await;
    }
    for _ in 0..6 {
        create_test_completed_recall_session(db, user.id, topic_id).await;
    }

    // 1 quiz with 1 attempt scoring 85 → practice_accuracy = 85.0
    let quiz_id = create_test_quiz(db, topic_id, "Newton Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user.id, 85).await;

    // 8 progress records from different users → engagement = growing
    for _i in 0..8 {
        let u = create_test_user(db, &unique_email("ov_p"), "pass", UserTypeEnums::STUDENT).await;
        create_test_learning_progress(db, u.id, topic_id, 50).await;
    }

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/overview", topic_id)).await;

    assert_eq!(json["recall_strength"], "strong");
    assert!((json["practice_accuracy"].as_f64().unwrap() - 85.0).abs() < 0.01);
    assert_eq!(json["dropoff_indicator"], "low");
    assert_eq!(json["engagement_trend"], "growing");
}

#[tokio::test]
async fn overview_returns_defaults_for_unknown_topic() {
    let (_status, json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/overview", Uuid::new_v4()),
    )
    .await;

    assert_eq!(json["recall_strength"], "unknown");
    assert_eq!(json["practice_accuracy"], 0.0);
    assert_eq!(json["dropoff_indicator"], "unknown");
    assert_eq!(json["engagement_trend"], "declining");
}

// ---------------------------------------------------------------------------
// Issues endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn issues_returns_placeholder_when_all_healthy() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Healthy", "HealthyCh", "HealthyTopic").await;
    let user = create_test_user(db, &unique_email("iss"), "pass", UserTypeEnums::ADMIN).await;

    // Strong recall: 8/10 correct
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    seed_recall_answers(db, session.id, 8, 10).await;

    // Low dropoff: all sessions completed
    for _ in 0..3 {
        create_test_completed_recall_session(db, user.id, topic_id).await;
    }

    // High accuracy: 90/100
    let quiz_id = create_test_quiz(db, topic_id, "Healthy Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user.id, 90).await;

    // Has video
    create_video(db, topic_id).await;

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/issues", topic_id)).await;

    let issues = json.as_array().unwrap();
    assert_eq!(issues.len(), 1);
    assert_eq!(issues[0]["id"], "no-issues");
    assert_eq!(issues[0]["severity"], "low");
}

#[tokio::test]
async fn issues_returns_multiple_when_problems_detected() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Issues", "IssuesCh", "IssuesTopic").await;
    let user = create_test_user(db, &unique_email("iss2"), "pass", UserTypeEnums::ADMIN).await;

    // Weak recall: 2 correct out of 10 → ratio 0.2 → recall-weak
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    seed_recall_answers(db, session.id, 2, 10).await;

    // High dropoff: 1 completed, 9 pending → rate 0.1 → dropoff-high
    for _ in 0..9 {
        create_incomplete_recall_session(db, user.id, topic_id).await;
    }

    // Low accuracy: score 30 → accuracy-low
    let quiz_id = create_test_quiz(db, topic_id, "Issues Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user.id, 30).await;

    // No video → missing-video

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/issues", topic_id)).await;

    let issues = json.as_array().unwrap();

    let severities: Vec<&str> = issues
        .iter()
        .map(|i| i["severity"].as_str().unwrap())
        .collect();
    assert!(
        severities.contains(&"high"),
        "should have recall-weak (high)"
    );
    assert!(
        severities.contains(&"critical"),
        "should have dropoff-high and accuracy-low (critical)"
    );
    assert!(
        severities.contains(&"medium"),
        "should have missing-video (medium)"
    );
}

#[tokio::test]
async fn issues_returns_placeholder_for_unknown_topic() {
    let (_status, json) = get_json(
        &TestApp::new().await,
        &format!("/api/v1/topics/{}/issues", Uuid::new_v4()),
    )
    .await;

    // No recall data, no quizzes, no video → only missing-video
    let issues = json.as_array().unwrap();
    let ids: Vec<&str> = issues.iter().map(|i| i["id"].as_str().unwrap()).collect();
    assert_eq!(ids, vec!["missing-video"]);
}

// ---------------------------------------------------------------------------
// Components endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn components_returns_all_six_with_correct_statuses() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Components", "CompCh", "CompTopic").await;

    // Seed: 1 video, 2 quizzes, 5 recall sessions, 10 progress records
    create_video(db, topic_id).await;
    create_test_quiz(db, topic_id, "Quiz 1").await;
    create_test_quiz(db, topic_id, "Quiz 2").await;
    let user = create_test_user(db, &unique_email("comp"), "pass", UserTypeEnums::STUDENT).await;
    for _ in 0..5 {
        create_test_completed_recall_session(db, user.id, topic_id).await;
    }
    for _ in 0..10 {
        let u = create_test_user(db, &unique_email("comp_p"), "pass", UserTypeEnums::STUDENT).await;
        create_test_learning_progress(db, u.id, topic_id, 50).await;
    }

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/components", topic_id)).await;

    let components = json.as_array().unwrap();
    assert_eq!(components.len(), 6);

    for comp in components {
        match comp["id"].as_str().unwrap() {
            "video" | "practice-questions" | "recall" | "flashcards" => {
                assert_eq!(
                    comp["status"], "published",
                    "{} should be published",
                    comp["id"]
                );
            }
            "study-notes" => {
                assert_eq!(comp["status"], "published");
                assert!(
                    comp["performance"]
                        .as_str()
                        .unwrap()
                        .contains("students accessed")
                );
            }
            "assignments" => {
                assert_eq!(comp["status"], "draft");
            }
            other => panic!("unexpected component id: {}", other),
        }
    }
}

#[tokio::test]
async fn components_shows_draft_when_no_content() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Empty", "EmptyCh", "EmptyTopic").await;

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/components", topic_id)).await;

    let components = json.as_array().unwrap();
    assert_eq!(components.len(), 6);

    for comp in components {
        match comp["id"].as_str().unwrap() {
            "study-notes" => assert_eq!(comp["status"], "published"),
            "assignments" => assert_eq!(comp["status"], "draft"),
            id @ ("video" | "practice-questions" | "recall" | "flashcards") => {
                assert_eq!(comp["status"], "draft", "{} should be draft", id);
            }
            other => panic!("unexpected component id: {}", other),
        }
    }
}

// ---------------------------------------------------------------------------
// Actions endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn actions_returns_six_items() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Actions", "ActionsCh", "ActionsTopic").await;

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/actions", topic_id)).await;

    let actions = json.as_array().unwrap();
    assert_eq!(actions.len(), 6);

    // Static actions regardless of topic
    let ids: Vec<&str> = actions.iter().map(|a| a["id"].as_str().unwrap()).collect();
    assert!(ids.contains(&"preview-as-student"));
    assert!(ids.contains(&"schedule-revision"));
    assert!(ids.contains(&"review-questions"));

    for action in actions {
        assert!(action["label"].as_str().is_some());
        assert!(action["description"].as_str().is_some());
        assert!(action["icon"].as_str().is_some());
    }
}

#[tokio::test]
async fn actions_are_static_regardless_of_topic() {
    let app = TestApp::new().await;
    // Known topic
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Act2", "Act2Ch", "Act2Topic").await;
    // Unknown topic
    let unknown_id = Uuid::new_v4();
    // Each returns the same 6 actions
    for tid in [topic_id, unknown_id] {
        let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/actions", tid)).await;
        assert_eq!(json.as_array().unwrap().len(), 6);
    }
}

// ---------------------------------------------------------------------------
// Trends endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn trends_returns_data_with_three_sessions() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Trends", "TrendsCh", "TrendsTopic").await;
    let user = create_test_user(db, &unique_email("tr"), "pass", UserTypeEnums::ADMIN).await;

    // Seed 3 recall sessions with 5 correct answers each
    for _ in 0..3 {
        let session = create_test_completed_recall_session(db, user.id, topic_id).await;
        seed_recall_answers(db, session.id, 5, 5).await;
    }

    // Seed 1 quiz with 2 attempts
    let quiz_id = create_test_quiz(db, topic_id, "Trends Quiz").await;
    create_test_assessment_attempt(db, quiz_id, user.id, 80).await;
    create_test_assessment_attempt(db, quiz_id, user.id, 90).await;

    let (_status, json) = get_json(&app, &format!("/api/v1/topics/{}/trends", topic_id)).await;

    assert!(json["recall_trend"].as_array().unwrap().len() >= 3);
    assert_eq!(
        json["practice_accuracy_trend"].as_array().unwrap().len(),
        2,
        "2 quiz attempts = 2 accuracy points"
    );
    assert!(json["engagement_trend"].as_array().unwrap().len() >= 3);
    assert_eq!(
        json["completion_trend"].as_array().unwrap().len(),
        2,
        "completion_trend matches practice_accuracy_trend count"
    );
}

#[tokio::test]
async fn trends_returns_null_when_single_session() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Trends2", "Trends2Ch", "Trends2Topic").await;
    let user = create_test_user(db, &unique_email("tr2"), "pass", UserTypeEnums::ADMIN).await;

    // Exactly 1 recall session → below threshold (< 2)
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    seed_recall_answers(db, session.id, 5, 5).await;

    let (status, body) = get_raw(&app, &format!("/api/v1/topics/{}/trends", topic_id)).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(&body[..], b"null");
}

#[tokio::test]
async fn trends_returns_null_when_no_data() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    let topic_id = create_content_hierarchy(db, "Trends0", "Trends0Ch", "Trends0Topic").await;

    let (status, body) = get_raw(&app, &format!("/api/v1/topics/{}/trends", topic_id)).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(&body[..], b"null");
}
