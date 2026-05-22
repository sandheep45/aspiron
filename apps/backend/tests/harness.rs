use axum::{
    Router,
    body::Body,
    http::{Request, StatusCode},
};
use backend::setup::app::{AppState, create_app};
use backend::setup::config::Config;
use migrations::{Migrator, MigratorTrait};
use sea_orm::{
    ActiveModelTrait, ConnectionTrait, Database, DatabaseConnection, DatabaseTransaction,
    TransactionTrait,
};
use std::future::Future;
use std::sync::Arc;
use testcontainers::ContainerAsync;
use testcontainers_modules::postgres::Postgres;
use testcontainers_modules::testcontainers::runners::AsyncRunner;
use tower::ServiceExt;

/// Test application harness.
///
/// Spins up an ephemeral PostgreSQL container, runs all migrations,
/// and builds the full Axum router for integration testing.
///
/// One container per test instance.
/// Test data is cleaned up when the container is dropped.
pub struct TestApp {
    pub db: Arc<DatabaseConnection>,
    pub router: Router,
    _container: ContainerAsync<Postgres>,
}

impl TestApp {
    pub async fn new() -> Self {
        let postgres = Postgres::default()
            .start()
            .await
            .expect("failed to start postgres container");

        let host = postgres
            .get_host()
            .await
            .expect("failed to get postgres host");
        let port = postgres
            .get_host_port_ipv4(5432)
            .await
            .expect("failed to get postgres port");

        let db_url = format!("postgres://postgres:postgres@{}:{}/postgres", host, port);

        let db = Database::connect(&db_url)
            .await
            .expect("failed to connect to test database");

        Migrator::up(&db, None)
            .await
            .expect("failed to run migrations");

        let config = Config::for_test();
        let app_state = AppState::new(Arc::new(config.clone()), db);
        let db = Arc::clone(&app_state.db);

        let router_with_state = create_app(&app_state.config, app_state.clone());
        let router = router_with_state.with_state(app_state);

        Self {
            db,
            router,
            _container: postgres,
        }
    }

    /// Run a test function inside a database transaction that is rolled back afterward.
    ///
    /// This provides test isolation without needing to reset the database between tests.
    pub async fn with_transaction<F, Fut>(&self, test_fn: F)
    where
        F: FnOnce(DatabaseTransaction) -> Fut,
        Fut: Future<Output = ()>,
    {
        let txn = self
            .db
            .begin()
            .await
            .expect("failed to begin test transaction");

        test_fn(txn).await;

        // Transaction is dropped without commit, causing automatic rollback
    }

    /// Send an HTTP request through the full router stack.
    ///
    /// Uses `tower::ServiceExt::oneshot` to exercise middleware,
    /// extractors, handlers, and error handling.
    pub async fn request(&self, req: Request<Body>) -> axum::http::Response<Body> {
        self.router
            .clone()
            .oneshot(req)
            .await
            .expect("request should not fail")
    }

    /// Convenience: send a GET request.
    pub async fn get(&self, path: &str) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("GET")
            .uri(path)
            .header("x-client-type", "BROWSER")
            .body(Body::empty())
            .expect("valid request");
        self.request(req).await
    }

    /// Convenience: send a POST request with a JSON body.
    pub async fn post_json(
        &self,
        path: &str,
        body: serde_json::Value,
    ) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("POST")
            .uri(path)
            .header("content-type", "application/json")
            .header("x-client-type", "BROWSER")
            .body(Body::from(
                serde_json::to_string(&body).expect("valid json"),
            ))
            .expect("valid request");
        self.request(req).await
    }

    /// Convenience: send a GET request with a cookie.
    pub async fn get_with_cookie(&self, path: &str, cookie: &str) -> axum::http::Response<Body> {
        let req = Request::builder()
            .method("GET")
            .uri(path)
            .header("x-client-type", "BROWSER")
            .header("cookie", cookie)
            .body(Body::empty())
            .expect("valid request");
        self.request(req).await
    }
}

/// Create a test user directly in the database.
///
/// Returns the user ID and the plaintext password for login testing.
pub async fn create_test_user<C: ConnectionTrait>(
    db: &C,
    email: &str,
    password: &str,
) -> (uuid::Uuid, String) {
    use backend::entries::entities::{user, user_profile};
    use chrono::Utc;

    let id = uuid::Uuid::new_v4();
    let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST).expect("hash password");
    let now: sea_orm::prelude::DateTimeWithTimeZone = Utc::now().into();

    let user_model = user::ActiveModel {
        id: sea_orm::Set(id),
        email: sea_orm::Set(email.to_string()),
        password_hash: sea_orm::Set(password_hash),
        is_active: sea_orm::Set(true),
        created_at: sea_orm::Set(now),
        updated_at: sea_orm::Set(now),
    };
    user_model.insert(db).await.expect("insert user");

    let profile_model = user_profile::ActiveModel {
        user_id: sea_orm::Set(id),
        first_name: sea_orm::Set(Some("Test".to_string())),
        last_name: sea_orm::Set(Some("User".to_string())),
        avatar_url: sea_orm::Set(None),
        phone: sea_orm::Set(None),
        timezone: sea_orm::Set(None),
        language: sea_orm::Set(None),
        preferences: sea_orm::Set(None),
        last_login: sea_orm::Set(None),
        login_count: sea_orm::Set(Some(0)),
        account_locked_until: sea_orm::Set(None),
        failed_login_attempts: sea_orm::Set(Some(0)),
        mfa_enabled: sea_orm::Set(None),
        mfa_secret_encrypted: sea_orm::Set(None),
    };
    profile_model.insert(db).await.expect("insert user profile");

    (id, password.to_string())
}

/// Extract the JWT cookie value from a login response.
pub fn extract_jwt_cookie(response: &axum::http::Response<Body>) -> String {
    let set_cookie = response
        .headers()
        .get("set-cookie")
        .expect("login response should have set-cookie header");

    let cookie_str = set_cookie.to_str().expect("cookie should be valid utf-8");
    // Extract the cookie name=value pair from the full Set-Cookie header
    cookie_str
        .split(';')
        .next()
        .expect("cookie should have name=value")
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;

    #[tokio::test]
    async fn health_endpoint_returns_ok() {
        let app = TestApp::new().await;

        let response = app.get("/api/v1/health").await;

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("failed to read body");
        let body: serde_json::Value =
            serde_json::from_slice(&body).expect("body should be valid JSON");

        assert_eq!(body["status"], "healthy");
        assert_eq!(body["version"], "0.1.0");
    }

    #[tokio::test]
    async fn health_endpoint_returns_json_content_type() {
        let app = TestApp::new().await;

        let response = app.get("/api/v1/health").await;

        let content_type = response
            .headers()
            .get("content-type")
            .expect("content-type header should exist");

        assert!(
            content_type
                .to_str()
                .expect("valid utf-8")
                .contains("application/json"),
            "expected application/json content type, got: {:?}",
            content_type
        );
    }

    #[tokio::test]
    async fn unknown_route_returns_404() {
        let app = TestApp::new().await;

        let response = app.get("/api/v1/nonexistent").await;

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn request_without_client_type_header_returns_401() {
        let app = TestApp::new().await;

        let req = Request::builder()
            .method("GET")
            .uri("/api/v1/health")
            .body(Body::empty())
            .expect("valid request");

        let response = app.request(req).await;

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn transaction_rolls_back_on_completion() {
        let app = TestApp::new().await;

        app.with_transaction(|db| async move {
            let result = db
                .execute(sea_orm::Statement::from_string(
                    sea_orm::DatabaseBackend::Postgres,
                    "SELECT 1".to_string(),
                ))
                .await;
            assert!(
                result.is_ok(),
                "database query should succeed in transaction"
            );
        })
        .await;
    }

    #[tokio::test]
    async fn auth_flow_login_returns_cookie_and_me_returns_user() {
        let app = TestApp::new().await;

        // 1. Create a test user directly in the database
        let email = "test.user@aspiron.test";
        let password = "testpass123";
        let (user_id, _) = create_test_user(app.db.as_ref(), email, password).await;

        // 2. Login with the user's credentials
        let login_response = app
            .post_json(
                "/api/v1/auth/login",
                serde_json::json!({
                    "email": email,
                    "password": password,
                }),
            )
            .await;

        assert_eq!(
            login_response.status(),
            StatusCode::OK,
            "login should succeed"
        );

        // 3. Extract the JWT cookie from the response
        let cookie = extract_jwt_cookie(&login_response);
        assert!(
            cookie.contains('='),
            "cookie should have name=value format, got: {}",
            cookie
        );

        // 4. Use the cookie to access the /me endpoint
        let me_response = app.get_with_cookie("/api/v1/auth/me", &cookie).await;

        assert_eq!(
            me_response.status(),
            StatusCode::OK,
            "/me should return 200 with valid cookie"
        );

        // 5. Verify the response contains the correct user data
        let body = to_bytes(me_response.into_body(), usize::MAX)
            .await
            .expect("failed to read body");
        let body: serde_json::Value =
            serde_json::from_slice(&body).expect("body should be valid JSON");

        // The response is wrapped in ApiResponse: { success: true, data: { user: { ... }, ... } }
        let user_data = &body["data"]["user"];
        assert_eq!(user_data["email"], email);
        assert_eq!(user_data["id"], user_id.to_string());
        assert!(user_data["is_active"].as_bool().unwrap_or(false));
    }

    #[tokio::test]
    async fn auth_flow_login_fails_with_wrong_password() {
        let app = TestApp::new().await;

        // 1. Create a test user
        let email = "wrong.pass@aspiron.test";
        let password = "correctpass";
        create_test_user(app.db.as_ref(), email, password).await;

        // 2. Try to login with wrong password
        let login_response = app
            .post_json(
                "/api/v1/auth/login",
                serde_json::json!({
                    "email": email,
                    "password": "wrongpassword",
                }),
            )
            .await;

        assert_eq!(
            login_response.status(),
            StatusCode::UNAUTHORIZED,
            "login should fail with wrong password"
        );
    }

    #[tokio::test]
    async fn auth_flow_me_fails_without_cookie() {
        let app = TestApp::new().await;

        // Try to access /me without any authentication
        let me_response = app.get("/api/v1/auth/me").await;

        assert_eq!(
            me_response.status(),
            StatusCode::UNAUTHORIZED,
            "/me should return 401 without auth"
        );
    }
}
