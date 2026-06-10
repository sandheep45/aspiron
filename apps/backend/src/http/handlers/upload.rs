use axum::Json;
use axum::body::Bytes;
use axum::extract::{Query, State};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::setup::app::AppState;
use crate::setup::error::AppError;

#[derive(Debug, Deserialize)]
pub struct UploadFileQuery {
    pub filename: String,
    pub content_type: String,
}

#[derive(Debug, Serialize)]
pub struct UploadFileResponse {
    pub url: String,
    pub file_key: String,
}

pub async fn handler_upload_file(
    State(app_state): State<AppState>,
    Query(query): Query<UploadFileQuery>,
    body: Bytes,
) -> Result<Json<UploadFileResponse>, AppError> {
    let s3_client = app_state
        .s3_client
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("S3 client not configured")))?;

    let file_key = format!(
        "uploads/{}_{}",
        Uuid::new_v4(),
        query.filename.replace(' ', "_")
    );

    let s3_config = &app_state.config.s3;
    let public_base_url = s3_config
        .endpoint
        .as_deref()
        .unwrap_or("https://s3.amazonaws.com");

    let url = crate::infra::storage::upload_file(
        &s3_client,
        &s3_config.bucket,
        &file_key,
        &query.content_type,
        body.to_vec(),
        public_base_url,
    )
    .await?;

    Ok(Json(UploadFileResponse { url, file_key }))
}
