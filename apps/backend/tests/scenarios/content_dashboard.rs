use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_completed_recall_session, create_test_recall_answer_variant,
};
use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::scenario_builder::ScenarioBuilder;

async fn login(app: &TestApp, email: &str, password: &str) -> String {
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({ "email": email, "password": password }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    extract_jwt_cookie(&login)
}

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

#[tokio::test]
async fn scenario_admin_views_full_dashboard() {
    let app = TestApp::new().await;

    ScenarioBuilder::new(app.db.as_ref())
        .with_user("admin@test.com", "admin123", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Mechanics Quiz")
        .questions(5)
        .completed_sessions()
        .answers(10)
        .build()
        .await;

    let _cookie = login(&app, "admin@test.com", "admin123").await;

    // Summary
    let summary = get_json(&app, "/api/v1/content/dashboard/summary").await;
    assert_eq!(summary["subjects_covered"], 1);
    assert_eq!(summary["topics_published"], 1);
    assert!(summary["topics_flagged"].as_i64().unwrap_or(0) >= 0);

    // Attention
    let attention = get_json(&app, "/api/v1/content/dashboard/attention").await;
    assert!(attention["total"].as_i64().unwrap_or(0) >= 0);
    assert!(attention["items"].as_array().is_some());

    // Subjects
    let subjects = get_json(&app, "/api/v1/content/dashboard/subjects").await;
    assert_eq!(subjects.as_array().unwrap().len(), 1);
    assert_eq!(subjects[0]["name"], "Physics");

    // Signals
    let signals = get_json(&app, "/api/v1/content/dashboard/signals").await;
    assert!(signals["highest_recall"].as_array().is_some());
    assert!(signals["fastest_decay"].as_array().is_some());
}

#[tokio::test]
async fn scenario_empty_dashboard_for_no_data() {
    let app = TestApp::new().await;

    ScenarioBuilder::new(app.db.as_ref())
        .with_user("admin@test.com", "admin123", UserTypeEnums::ADMIN)
        .build()
        .await;

    let _cookie = login(&app, "admin@test.com", "admin123").await;

    let summary = get_json(&app, "/api/v1/content/dashboard/summary").await;
    assert_eq!(summary["subjects_covered"], 0);
    assert_eq!(summary["topics_published"], 0);

    let attention = get_json(&app, "/api/v1/content/dashboard/attention").await;
    assert_eq!(attention["total"], 0);

    let subjects = get_json(&app, "/api/v1/content/dashboard/subjects").await;
    assert!(subjects.as_array().unwrap().is_empty());

    let signals = get_json(&app, "/api/v1/content/dashboard/signals").await;
    assert!(signals["highest_recall"].as_array().unwrap().is_empty());
    assert!(signals["fastest_decay"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn scenario_dashboard_reflects_recall_change() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Create admin + content via builder
    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@test.com", "admin123", UserTypeEnums::ADMIN)
        .with_user("student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Mechanics Quiz")
        .questions(5)
        .completed_sessions()
        .answers(10) // 10 correct answers → 100% accuracy → not flagged
        .build()
        .await;

    let _cookie = login(&app, "admin@test.com", "admin123").await;

    // Initially 0 flagged (100% accuracy is well above 40%)
    let summary = get_json(&app, "/api/v1/content/dashboard/summary").await;
    assert_eq!(summary["topics_flagged"], 0);

    // Now add more recall answers with all wrong to drop accuracy
    let topic = ctx.topic.as_ref().expect("topic exists");
    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");

    // Add 6 more completed sessions with all wrong answers
    // (builder also created sessions for admin, so we need more wrong answers
    //  to push total accuracy below 40%)
    for _ in 0..6 {
        let session = create_test_completed_recall_session(db, student.id, topic.id).await;
        for _ in 0..10 {
            create_test_recall_answer_variant(
                db,
                session.id,
                LearningRecallQuestionTypeEnum::MCQ,
                false,
                Some(0),
            )
            .await;
        }
    }

    // Accuracy = 20 correct / (20 + 60) total = 20/80 = 25% < 40% → flagged
    let summary2 = get_json(&app, "/api/v1/content/dashboard/summary").await;
    assert_eq!(summary2["topics_flagged"], 1);
}
