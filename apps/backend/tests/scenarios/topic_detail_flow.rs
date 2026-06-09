use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use uuid::Uuid;

use backend::entries::entities::content_video;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_assessment_attempt, create_test_completed_recall_session,
    create_test_learning_progress, create_test_quiz, create_test_recall_answer_variant,
    create_test_user,
};
use crate::harness::TestApp;
use crate::scenarios::scenario_builder::ScenarioBuilder;

static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

async fn get_raw(app: &TestApp, path: &str) -> Vec<u8> {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body")
        .to_vec()
}

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

#[tokio::test]
async fn topic_detail_full_workflow() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("td_admin2"), "pass", UserTypeEnums::ADMIN)
        .with_user(&unique_email("td_student2"), "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .build()
        .await;

    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");
    let topic = ctx.topic.as_ref().expect("topic");

    // -- Seed video
    content_video::ActiveModel {
        id: Set(Uuid::new_v4()),
        topic_id: Set(topic.id),
        title: Set("Newton's Laws Video".to_string()),
        duration_seconds: Set(600),
        video_url: Set("https://example.com/video".to_string()),
        transcript: Set(None),
    }
    .insert(db)
    .await
    .expect("insert video");

    // -- Seed 2 quizzes with 3 attempts total
    let quiz1 = create_test_quiz(db, topic.id, "Newton's Laws Quiz 1").await;
    let quiz2 = create_test_quiz(db, topic.id, "Newton's Laws Quiz 2").await;
    create_test_assessment_attempt(db, quiz1, student.id, 80).await;
    create_test_assessment_attempt(db, quiz1, student.id, 90).await;
    create_test_assessment_attempt(db, quiz2, student.id, 70).await;

    // -- Seed 3 completed recall sessions (all completed → low dropoff)
    let s1 = create_test_completed_recall_session(db, student.id, topic.id).await;
    seed_recall_answers(db, s1.id, 7, 10).await;
    let s2 = create_test_completed_recall_session(db, student.id, topic.id).await;
    seed_recall_answers(db, s2.id, 5, 10).await;
    let s3 = create_test_completed_recall_session(db, student.id, topic.id).await;
    seed_recall_answers(db, s3.id, 9, 10).await;

    // -- Seed learning progress from 8 distinct users → growing engagement
    for _ in 0..8 {
        let u =
            create_test_user(db, &unique_email("td_prog"), "pass", UserTypeEnums::STUDENT).await;
        create_test_learning_progress(db, u.id, topic.id, 50).await;
    }

    // ===================================================================
    // 1. Overview
    // ===================================================================
    let overview = get_json(&app, &format!("/api/v1/topics/{}/overview", topic.id)).await;

    // 21 correct / 30 total = 70% → "strong"
    assert_eq!(overview["recall_strength"], "strong");
    // total_possible = quiz_count × 100, total_score = sum of all scores
    // 240 / 200 = 1.2 → 120.0%
    assert!((overview["practice_accuracy"].as_f64().unwrap() - 120.0).abs() < 0.01);
    // 3 completed / 3 total = 1.0 → "low"
    assert_eq!(overview["dropoff_indicator"], "low");
    // 8 progress records → "growing"
    assert_eq!(overview["engagement_trend"], "growing");

    // ===================================================================
    // 2. Issues — all healthy → "no-issues" placeholder
    // ===================================================================
    let issues = get_json(&app, &format!("/api/v1/topics/{}/issues", topic.id)).await;
    let issue_ids: Vec<&str> = issues
        .as_array()
        .unwrap()
        .iter()
        .map(|i| i["id"].as_str().unwrap())
        .collect();
    assert!(
        issue_ids.contains(&"no-issues"),
        "expected no-issues, got: {:?}",
        issue_ids
    );

    // ===================================================================
    // 3. Components — all published except assignments
    // ===================================================================
    let components = get_json(&app, &format!("/api/v1/topics/{}/components", topic.id)).await;
    let comps = components.as_array().unwrap();
    assert_eq!(comps.len(), 6);
    for comp in comps {
        let id = comp["id"].as_str().unwrap();
        let status = comp["status"].as_str().unwrap();
        match id {
            "study-notes" => assert_eq!(status, "published"),
            "assignments" => assert_eq!(status, "draft"),
            _ => assert_eq!(status, "published", "{} should be published", id),
        }
    }

    // ===================================================================
    // 4. Actions — 6 static items
    // ===================================================================
    let actions = get_json(&app, &format!("/api/v1/topics/{}/actions", topic.id)).await;
    assert_eq!(actions.as_array().unwrap().len(), 6);
    for action in actions.as_array().unwrap() {
        assert!(action["label"].as_str().is_some());
        assert!(action["icon"].as_str().is_some());
    }

    // ===================================================================
    // 5. Trends
    // ===================================================================
    let trends = get_json(&app, &format!("/api/v1/topics/{}/trends", topic.id)).await;

    assert_eq!(trends["recall_trend"].as_array().unwrap().len(), 3);
    assert_eq!(trends["engagement_trend"].as_array().unwrap().len(), 3);
    assert_eq!(
        trends["practice_accuracy_trend"].as_array().unwrap().len(),
        3
    );
    assert_eq!(trends["completion_trend"].as_array().unwrap().len(), 3);

    // Verify recall values are 70.0, 50.0, or 90.0
    for point in trends["recall_trend"].as_array().unwrap() {
        let v = point["value"].as_f64().unwrap();
        assert!(
            (v - 50.0).abs() < 0.01 || (v - 70.0).abs() < 0.01 || (v - 90.0).abs() < 0.01,
            "unexpected recall value: {}",
            v
        );
    }
}

#[tokio::test]
async fn topic_detail_empty_workflow() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("td_empty2"), "pass", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Empty")
        .topic("EmptyTopic")
        .build()
        .await;

    let topic = ctx.topic.as_ref().expect("topic");

    // 1. Overview — no data → defaults
    let overview = get_json(&app, &format!("/api/v1/topics/{}/overview", topic.id)).await;
    assert_eq!(overview["recall_strength"], "unknown");
    assert_eq!(overview["practice_accuracy"], 0.0);
    assert_eq!(overview["dropoff_indicator"], "unknown");
    assert_eq!(overview["engagement_trend"], "declining");

    // 2. Issues — no data → only missing-video
    let issues = get_json(&app, &format!("/api/v1/topics/{}/issues", topic.id)).await;
    let issue_ids: Vec<&str> = issues
        .as_array()
        .unwrap()
        .iter()
        .map(|i| i["id"].as_str().unwrap())
        .collect();
    assert_eq!(issue_ids, vec!["missing-video"]);

    // 3. Components — no content → draft for most
    let components = get_json(&app, &format!("/api/v1/topics/{}/components", topic.id)).await;
    for comp in components.as_array().unwrap() {
        let id = comp["id"].as_str().unwrap();
        let status = comp["status"].as_str().unwrap();
        match id {
            "study-notes" => assert_eq!(status, "published"),
            "assignments" => assert_eq!(status, "draft"),
            _ => assert_eq!(status, "draft", "{} should be draft", id),
        }
    }

    // 4. Actions — static regardless of data
    let actions = get_json(&app, &format!("/api/v1/topics/{}/actions", topic.id)).await;
    assert_eq!(actions.as_array().unwrap().len(), 6);

    // 5. Trends — no recall sessions → null
    let body = get_raw(&app, &format!("/api/v1/topics/{}/trends", topic.id)).await;
    assert_eq!(&body[..], b"null");
}
