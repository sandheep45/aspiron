use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{create_test_learning_progress, ensure_analytics_permission};
use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::scenario_builder::ScenarioBuilder;

#[tokio::test]
async fn pain_points_full_workflow() {
    let app = TestApp::new().await;

    // Grant VIEW_ANALYTICS permission to ADMIN role before creating user
    ensure_analytics_permission(app.db.as_ref()).await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("admin@test.com", "admin123", UserTypeEnums::ADMIN)
        .with_user("student1@test.com", "pass1", UserTypeEnums::STUDENT)
        .with_user("student2@test.com", "pass2", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .completed_sessions()
        .answers(5)
        .build()
        .await;

    // Add learning progress records so get_topic_performance has student counts
    let topic = ctx.topic.as_ref().expect("topic should exist");
    let students: Vec<_> = ctx
        .users
        .iter()
        .filter(|(role, _)| **role == UserTypeEnums::STUDENT)
        .map(|(_, u)| u)
        .collect();
    for student in &students {
        create_test_learning_progress(app.db.as_ref(), student.id, topic.id, 50).await;
    }

    // Login as admin
    let admin = ctx.users.get(&UserTypeEnums::ADMIN).expect("admin");
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": admin.email,
                "password": "admin123",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    let cookie = extract_jwt_cookie(&login);

    // GET critical issues
    let response = app
        .get_with_cookie("/api/v1/admin/insights/pain-points/critical", &cookie)
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["total_urgent"], 0, "all answers correct → no critical");
    assert!(json["issues"].is_array());

    // GET pain points list
    let response = app
        .get_with_cookie(
            "/api/v1/admin/insights/pain-points?page=1&limit=10",
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["total"], 1, "one topic in results");
    let items = json["items"].as_array().expect("items array");
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["topic"], "Newton's Laws");

    // GET pattern insights
    let response = app
        .get_with_cookie("/api/v1/admin/insights/pain-points/insights", &cookie)
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let insights = json["insights"].as_array().expect("insights array");
    assert_eq!(insights.len(), 4, "4 pattern insights returned");

    // GET topic detail
    let response = app
        .get_with_cookie(
            &format!("/api/v1/admin/insights/pain-points/{}", topic.id),
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["topic"], "Newton's Laws");
    assert!(json["accuracy"].as_f64().is_some(), "accuracy is a number");
    assert!(
        json["trend"].as_str().is_some_and(|s| !s.is_empty()),
        "trend is non-empty"
    );
    assert!(json["common_mistakes"].is_array());
    assert!(json["weak_questions"].is_array());
    assert!(json["recommendations"].is_array());
}
