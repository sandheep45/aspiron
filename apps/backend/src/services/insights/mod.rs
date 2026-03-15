use std::sync::Arc;

use axum::{Extension, Json, extract::Query};

use crate::entries::dtos::payload::insights::InsightsQueryParams;
use crate::entries::dtos::response::insights::InsightsResponse;
use crate::services::insights::service::InsightsService;
use crate::setup::error::AppError;

pub mod repository;
pub mod service;

#[derive(Clone)]
pub struct InsightsState {
    pub insights_service: InsightsService,
}

impl InsightsState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            insights_service: InsightsService::new(db),
        }
    }
}

pub async fn get_insights_handler(
    Extension(insights_state): Extension<InsightsState>,
    Query(params): Query<InsightsQueryParams>,
) -> Result<Json<InsightsResponse>, AppError> {
    let (start, end) = params.get_time_window();
    let insights = insights_state
        .insights_service
        .get_insights(start, end)
        .await?;
    Ok(Json(insights))
}
