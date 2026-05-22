use crate::harness::{TestApp, create_test_user, extract_jwt_cookie};
use axum::body::Body;
use axum::http::Request;
use backend::utils::jwt::{Claims, encode_access_token};
use jsonwebtoken::{EncodingKey, Header, encode};

#[tokio::test]
async fn me_returns_200_with_valid_cookie() {
    let app = TestApp::new().await;
    let test_email = "valid_cookie@test.com";

    create_test_user(app.db.as_ref(), test_email, "password123").await;

    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": test_email,
                "password": "password123"
            }),
        )
        .await;
    assert_eq!(login.status(), 200);

    let cookie = extract_jwt_cookie(&login);

    let response = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(response.status(), 200);
}

#[tokio::test]
async fn me_returns_401_without_cookie() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/auth/me").await;
    assert_eq!(response.status(), 401);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn me_returns_401_with_expired_token_cookie() {
    let app = TestApp::new().await;

    let claims = Claims {
        sub: "550e8400-e29b-41d4-a716-446655440000".to_string(),
        exp: 1000000000,
    };
    let expired_token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret().as_bytes()),
    )
    .unwrap();

    let response = app
        .get_with_cookie(
            "/api/v1/auth/me",
            &format!("access_token={}", expired_token),
        )
        .await;
    assert_eq!(response.status(), 401);
}

#[tokio::test]
async fn me_returns_401_with_garbage_token_cookie() {
    let app = TestApp::new().await;

    let response = app
        .get_with_cookie("/api/v1/auth/me", "access_token=not.a.valid.jwt")
        .await;
    assert_eq!(response.status(), 401);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn me_returns_401_with_token_signed_with_wrong_secret() {
    let app = TestApp::new().await;

    let token = encode_access_token(
        "550e8400-e29b-41d4-a716-446655440000",
        "different-secret-key-that-is-not-the-same-one!",
        3600,
    )
    .unwrap();

    let response = app
        .get_with_cookie("/api/v1/auth/me", &format!("access_token={}", token))
        .await;
    assert_eq!(response.status(), 401);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn me_returns_200_with_authorization_bearer_header() {
    let app = TestApp::new().await;
    let test_email = "bearer_token@test.com";

    let (user_id, _) = create_test_user(app.db.as_ref(), test_email, "password123").await;

    let token = encode_access_token(&user_id.to_string(), jwt_secret(), 3600).unwrap();

    let req = Request::builder()
        .method("GET")
        .uri("/api/v1/auth/me")
        .header("x-client-type", "BROWSER")
        .header("authorization", format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.request(req).await;
    assert_eq!(response.status(), 200);
}

#[tokio::test]
async fn login_returns_401_with_wrong_password() {
    let app = TestApp::new().await;
    let test_email = "wrong_password@test.com";

    create_test_user(app.db.as_ref(), test_email, "correct_password").await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": test_email,
                "password": "wrong_password"
            }),
        )
        .await;
    assert_eq!(response.status(), 401);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["error"]["code"], "AUTH");
}

#[tokio::test]
async fn login_returns_401_for_nonexistent_user() {
    let app = TestApp::new().await;

    let response = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": "nobody@test.com",
                "password": "password123"
            }),
        )
        .await;
    assert_eq!(response.status(), 401);
}

fn jwt_secret() -> &'static str {
    "test-jwt-secret-for-testing-only-32chars!!"
}
