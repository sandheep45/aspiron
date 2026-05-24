#![allow(clippy::from_str_radix_10)]

use std::fmt;

use axum::{Json, response::IntoResponse};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use ts_rs::TS;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sea_orm::DbErr),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("Access token expired: {0}")]
    AccessTokenExpired(String),

    #[error("Refresh token expired: {0}")]
    RefreshTokenExpired(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Internal server error: {0}")]
    Internal(#[from] anyhow::Error),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[allow(clippy::from_str_radix_10)]
#[ts(export, rename = "ErrorCode")]
#[ts(repr(enum))]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    Validation,
    Auth,
    AccessTokenExpired,
    RefreshTokenExpired,
    Unauthorized,
    NotFound,
    Conflict,
    Internal,
}

impl fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let value = match self {
            ErrorCode::Validation => "VALIDATION",
            ErrorCode::Auth => "AUTH",
            ErrorCode::AccessTokenExpired => "ACCESS_TOKEN_EXPIRED",
            ErrorCode::RefreshTokenExpired => "REFRESH_TOKEN_EXPIRED",
            ErrorCode::Unauthorized => "UNAUTHORIZED",
            ErrorCode::NotFound => "NOT_FOUND",
            ErrorCode::Conflict => "CONFLICT",
            ErrorCode::Internal => "INTERNAL",
        };
        write!(f, "{}", value)
    }
}

impl From<&AppError> for ErrorCode {
    fn from(err: &AppError) -> Self {
        match err {
            AppError::Validation(_) => ErrorCode::Validation,
            AppError::Auth(_) => ErrorCode::Auth,
            AppError::AccessTokenExpired(_) => ErrorCode::AccessTokenExpired,
            AppError::RefreshTokenExpired(_) => ErrorCode::RefreshTokenExpired,
            AppError::Unauthorized(_) => ErrorCode::Unauthorized,
            AppError::NotFound(_) => ErrorCode::NotFound,
            AppError::Conflict(_) => ErrorCode::Conflict,
            AppError::Internal(_) | AppError::Database(_) => ErrorCode::Internal,
        }
    }
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

    pub fn refresh_token_expired<E: std::fmt::Display>(e: E) -> Self {
        AppError::RefreshTokenExpired(e.to_string())
    }

    pub fn access_token_expired<E: std::fmt::Display>(e: E) -> Self {
        AppError::AccessTokenExpired(e.to_string())
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
        let code = ErrorCode::from(&self);
        let (status, message, details) = match &self {
            AppError::Database(e) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "A database error occurred".to_string(),
                Some(serde_json::json!({ "detail": e.to_string() })),
            ),
            AppError::Validation(e) => (
                axum::http::StatusCode::BAD_REQUEST,
                "Validation failed".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::RefreshTokenExpired(e) => (
                axum::http::StatusCode::BAD_REQUEST,
                "Refresh token expired".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::AccessTokenExpired(e) => (
                axum::http::StatusCode::BAD_REQUEST,
                "Access token expired".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::Auth(e) => (
                axum::http::StatusCode::UNAUTHORIZED,
                "Authentication failed".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::Unauthorized(e) => (
                axum::http::StatusCode::FORBIDDEN,
                "Unauthorized access".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::NotFound(e) => (
                axum::http::StatusCode::NOT_FOUND,
                "Resource not found".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::Conflict(e) => (
                axum::http::StatusCode::CONFLICT,
                "Resource conflict".to_string(),
                Some(serde_json::json!({ "detail": e })),
            ),
            AppError::Internal(e) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "An internal error occurred".to_string(),
                Some(serde_json::json!({ "detail": e.to_string() })),
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
