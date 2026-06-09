use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::helpers::TestAppExt;
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

async fn get_json(app: &TestApp, path: &str, cookie: &str) -> serde_json::Value {
    let resp = app.get_with_cookie(path, cookie).await;
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

async fn post_json(
    app: &TestApp,
    path: &str,
    body: serde_json::Value,
    cookie: &str,
) -> (StatusCode, serde_json::Value) {
    let resp = app.post_json_with_cookie(path, body, cookie).await;
    let status = resp.status();
    let body_bytes = to_bytes(resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value =
        serde_json::from_slice(&body_bytes).unwrap_or(serde_json::Value::Null);
    (status, json)
}

#[tokio::test]
async fn daily_revision_quiz_attempt_and_score() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("dr1@test.com", "pass123", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Daily Revision Quiz")
        .questions(3)
        .build()
        .await;

    let student = ctx.user(&UserTypeEnums::STUDENT);
    let topic_id = ctx.topic_id();
    let quiz_id = ctx.quiz_id();

    let cookie = login(&app, &student.email, "pass123").await;

    let questions = get_json(
        &app,
        &format!("/api/v1/quizzes/{}/questions", quiz_id),
        &cookie,
    )
    .await;
    let qs = questions.as_array().expect("questions array");
    assert_eq!(qs.len(), 3);

    let (status, attempt_json) = post_json(
        &app,
        "/api/v1/attempts",
        serde_json::json!({ "quiz_id": quiz_id }),
        &cookie,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let attempt_id = attempt_json["id"].as_str().expect("attempt id");

    let answers: Vec<serde_json::Value> = qs
        .iter()
        .map(|q| {
            serde_json::json!({
                "question_id": q["id"],
                "answer": "A",
            })
        })
        .collect();

    let (submit_status, _) = post_json(
        &app,
        &format!("/api/v1/attempts/{}/submit", attempt_id),
        serde_json::json!({ "answers": answers }),
        &cookie,
    )
    .await;
    assert_eq!(submit_status, StatusCode::OK);

    let result = get_json(
        &app,
        &format!("/api/v1/attempts/{}/results", attempt_id),
        &cookie,
    )
    .await;
    assert_eq!(result["total_questions"], 3);
    assert!(result["score_percent"].as_i64().unwrap_or(0) > 0);

    let (status, _) = post_json(
        &app,
        "/api/v1/recall/start",
        serde_json::json!({ "topic_id": topic_id }),
        &cookie,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let progress = post_json(
        &app,
        "/api/v1/progress/update",
        serde_json::json!({ "topic_id": topic_id, "progress_percent": 50 }),
        &cookie,
    )
    .await;
    assert_eq!(progress.0, StatusCode::OK);

    let summary = get_json(&app, "/api/v1/progress/summary", &cookie).await;
    assert!(summary["progress_percent"].as_i64().is_some());
}
