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
async fn scenario_admin_views_subjects_page() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Create both admin (to login) and student (for recall session)
    let _ctx = ScenarioBuilder::new(db)
        .with_user("admin@test.com", "pass", UserTypeEnums::ADMIN)
        .with_user("student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Phys Quiz")
        .questions(3)
        .recall_session()
        .build()
        .await;

    let _cookie = login(&app, "admin@test.com", "pass").await;

    // Subjects endpoint
    let subjects = get_json(&app, "/api/v1/content/subjects-page").await;
    let items = subjects.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Physics");
    assert!(items[0]["chapters_count"].as_i64().unwrap() > 0);

    // Summary endpoint
    let summary = get_json(&app, "/api/v1/content/subjects-page/summary").await;
    assert_eq!(summary["total_subjects"], 1);
    assert_eq!(summary["total_topics"], 1);
    assert_eq!(summary["published_topics"], 1);

    // Signals endpoint
    let signals = get_json(&app, "/api/v1/content/subjects-page/signals").await;
    assert!(signals.as_array().unwrap().len() <= 4);
}

#[tokio::test]
async fn scenario_subjects_page_no_content() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let _ctx = ScenarioBuilder::new(db)
        .with_user("admin@empty.test", "pass", UserTypeEnums::ADMIN)
        .build()
        .await;

    let _cookie = login(&app, "admin@empty.test", "pass").await;

    let subjects = get_json(&app, "/api/v1/content/subjects-page").await;
    assert!(subjects.as_array().unwrap().is_empty());

    let summary = get_json(&app, "/api/v1/content/subjects-page/summary").await;
    assert_eq!(summary["total_subjects"], 0);

    let signals = get_json(&app, "/api/v1/content/subjects-page/signals").await;
    assert!(signals.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn scenario_signals_update_after_recall_change() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@signal.test", "pass", UserTypeEnums::ADMIN)
        .with_user("student@signal.test", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Phys Quiz")
        .questions(3)
        .recall_session()
        .build()
        .await;

    let _cookie = login(&app, "admin@signal.test", "pass").await;

    // The recall_session creates incomplete session (no answers yet),
    // so recall = None → no negative signal yet
    let signals_before = get_json(&app, "/api/v1/content/subjects-page/signals").await;
    let types_before: Vec<&str> = signals_before
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["signal_type"].as_str().unwrap())
        .collect();
    assert!(!types_before.contains(&"negative"));

    // Add wrong answers to tank recall below 50%
    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");
    let topic_id = ctx.topic.as_ref().expect("topic").id;
    let low_recall_session = create_test_completed_recall_session(db, student.id, topic_id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            db,
            low_recall_session.id,
            LearningRecallQuestionTypeEnum::MCQ,
            false,
            Some(0),
        )
        .await;
    }

    let signals_after = get_json(&app, "/api/v1/content/subjects-page/signals").await;
    let types_after: Vec<&str> = signals_after
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["signal_type"].as_str().unwrap())
        .collect();
    assert!(types_after.contains(&"negative"));
}
