use std::collections::HashMap;

use axum::{body::Body, body::to_bytes, http::StatusCode};

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::scenario_builder::ScenarioBuilder;

fn extract_cookies(response: &axum::http::Response<Body>) -> HashMap<String, String> {
    let mut cookies = HashMap::new();
    for header in response.headers().get_all("set-cookie") {
        let cookie_str = header.to_str().expect("cookie should be valid utf-8");
        if let Some(name_value) = cookie_str.split(';').next() {
            let trimmed = name_value.trim();
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].to_string();
                let value = trimmed[eq_pos + 1..].to_string();
                cookies.insert(name, value);
            }
        }
    }
    cookies
}

#[tokio::test]
async fn student_registers_logs_in_and_accesses_content() {
    let app = TestApp::new().await;

    // Build a scenario: student + content hierarchy
    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("alice@aspiron.test", "secure123", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .build()
        .await;

    let student = ctx.users.get(&UserTypeEnums::STUDENT).unwrap();
    let topic = ctx.topic.as_ref().unwrap();

    // Step 1: Login with credentials
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "secure123",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK, "login should succeed");

    let cookie = extract_jwt_cookie(&login);
    assert!(cookie.contains('='), "cookie should have name=value");

    // Step 2: Fetch current user profile
    let me = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(me.status(), StatusCode::OK, "/me should succeed");

    let body = to_bytes(me.into_body(), usize::MAX)
        .await
        .expect("read body");
    let body: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    assert_eq!(body["data"]["user"]["email"], student.email);
    assert_eq!(body["data"]["user"]["id"], student.id.to_string());
    assert!(body["data"]["user"]["is_active"].as_bool().unwrap_or(false));

    // Step 3: Access a topic by ID
    let topic_resp = app
        .get_with_cookie(&format!("/api/v1/topics/{}", topic.id), &cookie)
        .await;
    assert_eq!(
        topic_resp.status(),
        StatusCode::OK,
        "topic endpoint should work"
    );

    let topic_body = to_bytes(topic_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let topic_body: serde_json::Value = serde_json::from_slice(&topic_body).expect("parse JSON");

    assert_eq!(topic_body["name"], "Newton's Laws");
}

#[tokio::test]
async fn student_refresh_token_rotates_credentials() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("bob@aspiron.test", "refreshme", UserTypeEnums::STUDENT)
        .build()
        .await;

    let student = ctx.users.get(&UserTypeEnums::STUDENT).unwrap();

    // Login
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "refreshme",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);

    let cookies = extract_cookies(&login);
    let refresh_cookie = cookies
        .iter()
        .find(|(name, _)| name.contains("refresh"))
        .map(|(name, value)| format!("{}={}", name, value))
        .expect("refresh cookie should exist");

    // Refresh the token using the refresh cookie
    let refresh = app
        .get_with_cookie("/api/v1/auth/refresh-token", &refresh_cookie)
        .await;
    assert_eq!(refresh.status(), StatusCode::OK, "refresh should succeed");

    // The refreshed response sets new cookies; use the new access token
    let refreshed_cookies = extract_cookies(&refresh);
    let access_cookie = refreshed_cookies
        .iter()
        .find(|(name, _)| !name.contains("refresh"))
        .map(|(name, value)| format!("{}={}", name, value))
        .expect("access cookie should exist after refresh");

    let me = app.get_with_cookie("/api/v1/auth/me", &access_cookie).await;
    assert_eq!(
        me.status(),
        StatusCode::OK,
        "/me with refreshed token should work"
    );
}

#[tokio::test]
async fn student_login_fails_with_wrong_email() {
    let app = TestApp::new().await;

    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": "nonexistent@aspiron.test",
                "password": "anypass",
            }),
        )
        .await;

    assert_eq!(
        login.status(),
        StatusCode::UNAUTHORIZED,
        "unknown email should 401"
    );
}
