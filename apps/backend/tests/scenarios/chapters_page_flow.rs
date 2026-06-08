use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_chapter, create_test_completed_recall_session, create_test_quiz,
    create_test_recall_answer_variant, create_test_topic,
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
async fn scenario_admin_views_chapters_page() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@test.com", "pass", UserTypeEnums::ADMIN)
        .with_user("student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .build()
        .await;

    let subject_id = ctx.subject.as_ref().expect("subject").id;

    // Create 3 chapters with varying metrics using direct helpers
    // Ch1: high recall + quiz → healthy
    let ch1 = create_test_chapter(db, subject_id, "Mechanics", 1).await;
    let t1 = create_test_topic(db, ch1.id, "Newton's Laws", 1).await;
    create_test_quiz(db, t1.id, "Mechanics Quiz").await;
    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");
    let session1 = create_test_completed_recall_session(db, student.id, t1.id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            db,
            session1.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }

    // Ch2: low recall + no quiz → needs attention
    let ch2 = create_test_chapter(db, subject_id, "Thermodynamics", 2).await;
    let t2 = create_test_topic(db, ch2.id, "Thermo 101", 1).await;
    create_test_quiz(db, t2.id, "Thermo Quiz").await;
    let session2 = create_test_completed_recall_session(db, student.id, t2.id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            db,
            session2.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            false,
            Some(0),
        )
        .await;
    }

    // Ch3: topic created but no quiz → draft
    let ch3 = create_test_chapter(db, subject_id, "Optics", 3).await;
    let _t3 = create_test_topic(db, ch3.id, "Light", 1).await;

    let _cookie = login(&app, "admin@test.com", "pass").await;

    // Summary endpoint
    let summary = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/summary"),
    )
    .await;
    assert_eq!(summary["subject_name"], "Physics");
    assert_eq!(summary["total_chapters"], 3);
    assert_eq!(summary["published_topics"], 2);
    assert_eq!(summary["draft_topics"], 1);

    // Chapters endpoint
    let chapters = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/chapters"),
    )
    .await;
    let items = chapters.as_array().unwrap();
    assert_eq!(items.len(), 3);
    let names: Vec<&str> = items.iter().map(|i| i["name"].as_str().unwrap()).collect();
    assert!(names.contains(&"Mechanics"));
    assert!(names.contains(&"Thermodynamics"));
    assert!(names.contains(&"Optics"));

    // Insights endpoint
    let insights = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/insights"),
    )
    .await;
    let signals = insights.as_array().unwrap();
    assert!(!signals.is_empty());
}

#[tokio::test]
async fn scenario_chapters_page_no_content() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@empty.test", "pass", UserTypeEnums::ADMIN)
        .subject("EmptySubject", ExamTypeEnums::JEE)
        .build()
        .await;

    let subject_id = ctx.subject.as_ref().expect("subject").id;
    let _cookie = login(&app, "admin@empty.test", "pass").await;

    // Chapters should be empty
    let chapters = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/chapters"),
    )
    .await;
    assert!(chapters.as_array().unwrap().is_empty());

    // Summary should have 0 values
    let summary = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/summary"),
    )
    .await;
    assert_eq!(summary["total_chapters"], 0);

    // Insights returns at least the "no-data" signal
    let insights = get_json(
        &app,
        &format!("/api/v1/subjects/{subject_id}/chapters-page/insights"),
    )
    .await;
    let signals = insights.as_array().unwrap();
    assert!(!signals.is_empty());
    let ids: Vec<&str> = signals.iter().map(|s| s["id"].as_str().unwrap()).collect();
    assert!(ids.contains(&"no-data"));
}

#[tokio::test]
async fn scenario_chapters_combined_search_and_sort() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@search.test", "pass", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .build()
        .await;

    let subject_id = ctx.subject.as_ref().expect("subject").id;

    // Create chapters with distinct names for search testing
    create_test_chapter(db, subject_id, "Mechanics Advanced", 1).await;
    create_test_chapter(db, subject_id, "Quantum Mechanics", 2).await;
    create_test_chapter(db, subject_id, "Thermodynamics", 3).await;

    let _cookie = login(&app, "admin@search.test", "pass").await;

    // Search + sort together
    let json = get_json(
        &app,
        &format!(
            "/api/v1/subjects/{subject_id}/chapters-page/chapters?search=Mech&sort_by=coverage&sort_order=asc"
        ),
    )
    .await;

    let items = json.as_array().unwrap();
    assert_eq!(items.len(), 2);
    // Both items match "Mech" search, coverage is 0 for both so sort is stable
    let names: Vec<&str> = items.iter().map(|i| i["name"].as_str().unwrap()).collect();
    assert!(names.contains(&"Mechanics Advanced"));
    assert!(names.contains(&"Quantum Mechanics"));
}
