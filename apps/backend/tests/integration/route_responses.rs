use crate::harness::{TestApp, create_test_user, extract_jwt_cookie};
use axum::body::{Body, to_bytes};
use axum::http::Request;

#[tokio::test]
async fn health_returns_200_with_expected_body() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/health").await;
    assert_eq!(response.status(), 200);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["status"], "healthy");
    assert_eq!(json["version"], "0.1.0");
}

#[tokio::test]
async fn health_requires_client_type_header() {
    let app = TestApp::new().await;

    let req = Request::builder()
        .method("GET")
        .uri("/api/v1/health")
        .body(Body::empty())
        .unwrap();

    let response = app.request(req).await;
    assert_eq!(response.status(), 401);
}

#[tokio::test]
async fn unknown_route_returns_404() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/nonexistent").await;
    assert_eq!(response.status(), 404);
}

#[tokio::test]
async fn missing_client_type_header_returns_401() {
    let app = TestApp::new().await;

    let req = axum::http::Request::builder()
        .method("GET")
        .uri("/api/v1/auth/me")
        .body(axum::body::Body::empty())
        .unwrap();

    let response = app.request(req).await;
    assert_eq!(response.status(), 401);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let text = String::from_utf8(body.to_vec()).unwrap();
    assert_eq!(text, "Missing x-client-type header");
}

#[tokio::test]
async fn login_with_valid_credentials_returns_200_with_cookies() {
    let app = TestApp::new().await;
    let email = "login_test@test.com";

    create_test_user(app.db.as_ref(), email, "correct_password").await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": email,
                "password": "correct_password",
            }),
        )
        .await;

    assert_eq!(response.status(), 200);

    let cookie = extract_jwt_cookie(&response);
    assert!(!cookie.is_empty(), "should have set-cookie header");
    assert!(
        cookie.starts_with("test_jwt="),
        "cookie should use test_jwt name"
    );
}

#[tokio::test]
async fn login_with_wrong_password_returns_401() {
    let app = TestApp::new().await;
    let email = "wrong_pw@test.com";

    create_test_user(app.db.as_ref(), email, "real_password").await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": email,
                "password": "wrong_password",
            }),
        )
        .await;

    assert_eq!(response.status(), 401);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn login_with_missing_fields_returns_422() {
    let app = TestApp::new().await;

    let response = app
        .post_json("/api/v1/auth/login", serde_json::json!({}))
        .await;

    assert_eq!(response.status(), 422);
}

#[tokio::test]
async fn login_with_nonexistent_email_returns_401() {
    let app = TestApp::new().await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": "noone@test.com",
                "password": "any_password",
            }),
        )
        .await;

    assert_eq!(response.status(), 401);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn login_still_works_with_mobile_client_type() {
    let app = TestApp::new().await;
    let email = "mobile_login@test.com";

    create_test_user(app.db.as_ref(), email, "password").await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": email,
                "password": "password",
            }),
        )
        .await;

    assert_eq!(response.status(), 200);
}
