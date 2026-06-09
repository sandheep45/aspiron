use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::helpers::TestAppExt;
use crate::scenarios::scenario_builder::ScenarioBuilder;

#[tokio::test]
async fn recall_session_lifecycle_completion() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("recall_student@test.com", "pass123", UserTypeEnums::STUDENT)
        .subject("Math", ExamTypeEnums::JEE)
        .chapter("Algebra")
        .topic("Quadratic Equations")
        .quiz("Algebra Quiz")
        .questions(3)
        .build()
        .await;

    let student = ctx.user(&UserTypeEnums::STUDENT);
    let topic_id = ctx.topic_id();
    let quiz_id = ctx.quiz_id();

    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass123",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    let cookie = extract_jwt_cookie(&login);

    let start_resp = app
        .post_json_with_cookie(
            "/api/v1/recall/start",
            serde_json::json!({ "topic_id": topic_id }),
            &cookie,
        )
        .await;
    assert_eq!(start_resp.status(), StatusCode::OK);
    let body = to_bytes(start_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let start_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let session_id = start_json["id"].as_str().expect("session id").to_string();

    let mcqs_resp = app
        .get_with_cookie(&format!("/api/v1/recall/{}/mcqs", session_id), &cookie)
        .await;
    assert_eq!(mcqs_resp.status(), StatusCode::OK);
    let body = to_bytes(mcqs_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let mcqs: Vec<serde_json::Value> = serde_json::from_slice(&body).expect("parse JSON");

    let submit_payload: serde_json::Value = serde_json::json!(
        mcqs.iter()
            .map(|q| {
                serde_json::json!({
                    "question_id": q["id"],
                    "selected_option": 0,
                })
            })
            .collect::<Vec<_>>()
    );

    let submit_resp = app
        .post_json_with_cookie(
            &format!("/api/v1/recall/{}/mcqs/submit", session_id),
            submit_payload,
            &cookie,
        )
        .await;
    assert_eq!(submit_resp.status(), StatusCode::OK);

    let result_resp = app
        .get_with_cookie(&format!("/api/v1/recall/{}/result", session_id), &cookie)
        .await;
    assert_eq!(result_resp.status(), StatusCode::OK);
    let body = to_bytes(result_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let result: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(result["total_questions"], 3);
    assert!(result["score_percent"].as_i64().unwrap_or(0) >= 0);
    assert!(result["score_percent"].as_i64().unwrap_or(0) <= 100);

    let _ = quiz_id;
}

#[tokio::test]
async fn recall_session_no_mcqs_when_no_quiz() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("recall_noq@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("English", ExamTypeEnums::JEE)
        .chapter("Grammar")
        .topic("Tenses")
        .build()
        .await;

    let student = ctx.user(&UserTypeEnums::STUDENT);
    let topic_id = ctx.topic_id();

    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    let cookie = extract_jwt_cookie(&login);

    let start_resp = app
        .post_json_with_cookie(
            "/api/v1/recall/start",
            serde_json::json!({ "topic_id": topic_id }),
            &cookie,
        )
        .await;
    assert_eq!(start_resp.status(), StatusCode::OK);
    let body = to_bytes(start_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let start_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let session_id = start_json["id"].as_str().expect("session id");

    let mcqs_resp = app
        .get_with_cookie(&format!("/api/v1/recall/{}/mcqs", session_id), &cookie)
        .await;
    assert_eq!(mcqs_resp.status(), StatusCode::OK);
    let body = to_bytes(mcqs_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let mcqs: Vec<serde_json::Value> = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        mcqs.is_empty(),
        "expected empty questions when no quiz exists"
    );
}
