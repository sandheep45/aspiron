use std::sync::{Arc, LazyLock, RwLock};

use axum::{
    body::Body,
    extract::FromRequestParts,
    http::Request,
    middleware::Next,
    response::{IntoResponse, Response},
};
use uuid::Uuid;

use crate::setup::error::AppError;
use crate::utils::jwt::decode_jwt;

#[derive(Clone, Debug)]
pub enum PathMatch {
    Exact(String),
    Prefix(String),
}

impl PathMatch {
    pub fn exact(path: &str) -> Self {
        Self::Exact(path.to_string())
    }

    pub fn prefix(path: &str) -> Self {
        Self::Prefix(path.to_string())
    }
}

static EXEMPT_PATHS: LazyLock<RwLock<Vec<PathMatch>>> = LazyLock::new(|| RwLock::new(Vec::new()));

pub fn register_exempt_paths(paths: Vec<PathMatch>) {
    EXEMPT_PATHS.write().unwrap().extend(paths);
}

fn is_path_exempt(path: &str) -> bool {
    let exempt = EXEMPT_PATHS.read().unwrap();
    exempt.iter().any(|m| match m {
        PathMatch::Exact(p) => p.as_str() == path,
        PathMatch::Prefix(p) => path.starts_with(p.as_str()),
    })
}

#[derive(Clone)]
pub struct AuthMiddlewareState {
    pub jwt_secret: Arc<String>,
}

impl AuthMiddlewareState {
    pub fn new(jwt_secret: String) -> Self {
        Self {
            jwt_secret: Arc::new(jwt_secret),
        }
    }
}

#[derive(Clone, Debug)]
pub struct AuthUser(pub Uuid);

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<AuthUser>()
            .cloned()
            .ok_or(AppError::Auth("Authentication required".to_string()))
    }
}

pub async fn require_auth(mut request: Request<Body>, next: Next) -> Response {
    let path = request.uri().path();

    if is_path_exempt(path) {
        return next.run(request).await;
    }

    let state = request.extensions().get::<AuthMiddlewareState>().cloned();

    let state = match state {
        Some(s) => s,
        None => {
            return AppError::Internal(anyhow::anyhow!("Auth middleware not configured"))
                .into_response();
        }
    };

    let token = extract_token(&request);

    match token {
        Some(token) => match decode_jwt(&token, &state.jwt_secret) {
            Ok(claims) => match Uuid::parse_str(&claims.sub) {
                Ok(user_id) => {
                    request.extensions_mut().insert(AuthUser(user_id));
                    next.run(request).await
                }
                Err(_) => AppError::Auth("Invalid user ID".to_string()).into_response(),
            },
            Err(_) => AppError::Auth("Invalid or expired token".to_string()).into_response(),
        },
        None => AppError::Auth("Missing authentication token".to_string()).into_response(),
    }
}

fn extract_token(request: &Request<Body>) -> Option<String> {
    if let Some(cookie_header) = request.headers().get("cookie")
        && let Ok(cookie_str) = cookie_header.to_str()
    {
        for cookie in cookie_str.split(';') {
            let cookie = cookie.trim();
            if cookie.starts_with("access_token=") {
                return Some(cookie.strip_prefix("access_token=").unwrap().to_string());
            }
        }
    }

    if let Some(auth_header) = request.headers().get("authorization")
        && let Ok(auth_str) = auth_header.to_str()
        && let Some(token) = auth_str.strip_prefix("Bearer ")
    {
        return Some(token.to_string());
    }

    None
}
