use axum::{Json, response::IntoResponse};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sea_orm::DbErr),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Internal server error: {0}")]
    Internal(#[from] anyhow::Error),
}

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: ErrorDetails,
    pub request_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ErrorDetails {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

impl AppError {
    pub fn validation<E: std::fmt::Display>(e: E) -> Self {
        AppError::Validation(e.to_string())
    }

    pub fn auth<E: std::fmt::Display>(e: E) -> Self {
        AppError::Auth(e.to_string())
    }

    pub fn not_found<E: std::fmt::Display>(e: E) -> Self {
        AppError::NotFound(e.to_string())
    }

    pub fn conflict<E: std::fmt::Display>(e: E) -> Self {
        AppError::Conflict(e.to_string())
    }

    pub fn unauthorized<E: std::fmt::Display>(e: E) -> Self {
        AppError::Unauthorized(e.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (code, message, details, status) = match self {
            AppError::Database(e) => (
                "DATABASE_ERROR",
                "A database error occurred".to_string(),
                Some(serde_json::json!({ "detail": e.to_string() })),
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            ),
            AppError::Validation(e) => (
                "VALIDATION_ERROR",
                "Validation failed".to_string(),
                Some(serde_json::json!({ "detail": e })),
                axum::http::StatusCode::BAD_REQUEST,
            ),
            AppError::Auth(e) => (
                "AUTHENTICATION_ERROR",
                "Authentication failed".to_string(),
                Some(serde_json::json!({ "detail": e })),
                axum::http::StatusCode::UNAUTHORIZED,
            ),
            AppError::Unauthorized(e) => (
                "UNAUTHORIZED",
                "Unauthorized access".to_string(),
                Some(serde_json::json!({ "detail": e })),
                axum::http::StatusCode::FORBIDDEN,
            ),
            AppError::NotFound(e) => (
                "NOT_FOUND",
                "Resource not found".to_string(),
                Some(serde_json::json!({ "detail": e })),
                axum::http::StatusCode::NOT_FOUND,
            ),
            AppError::Conflict(e) => (
                "CONFLICT",
                "Resource conflict".to_string(),
                Some(serde_json::json!({ "detail": e })),
                axum::http::StatusCode::CONFLICT,
            ),
            AppError::Internal(e) => (
                "INTERNAL_ERROR",
                "An internal error occurred".to_string(),
                Some(serde_json::json!({ "detail": e.to_string() })),
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            ),
        };

        let response = ErrorResponse {
            error: ErrorDetails {
                code: code.to_string(),
                message,
                details,
            },
            request_id: None,
        };

        (status, Json(response)).into_response()
    }
}

pub type Result<T, E = AppError> = std::result::Result<T, E>;
