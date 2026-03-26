use axum::{Extension, Json, Router, extract::Query, middleware, routing::get};

use crate::entries::dtos::payload::insights::{InsightsQueryParams, TopicPerformanceQueryParams};
use crate::entries::dtos::response::insights::{InsightsResponse, TopicPerformanceResponse};
use crate::middleware::auth::{AuthUser, require_auth};
use crate::services::insights::{
    InsightsState,
    handler::{get_insights_handler, get_topic_performance_handler},
};
use crate::setup::app::AppState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/admin/insights",
    tag = "Insights",
    params(
        InsightsQueryParams
    ),
    responses(
        (status = 200, description = "Get admin insights with pagination and filtering")
    )
)]
pub async fn get_insights(
    Extension(insights_state): Extension<InsightsState>,
    Query(params): Query<InsightsQueryParams>,
) -> Result<Json<InsightsResponse>, AppError> {
    get_insights_handler(Extension(insights_state), Query(params)).await
}

#[utoipa::path(
    get,
    path = "/api/v1/admin/insights/topics",
    tag = "Insights",
    params(
        TopicPerformanceQueryParams
    ),
    responses(
        (status = 200, description = "Get topic performance insights"),
        (status = 401, description = "Unauthorized - Missing VIEW_ANALYTICS permission")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
pub async fn get_topic_performance(
    Extension(insights_state): Extension<InsightsState>,
    AuthUser(user_id): AuthUser,
    Query(params): Query<TopicPerformanceQueryParams>,
) -> Result<Json<TopicPerformanceResponse>, AppError> {
    get_topic_performance_handler(Extension(insights_state), user_id, Query(params)).await
}

pub fn router(app_state: &AppState) -> Router<AppState> {
    let state = InsightsState::new(app_state.db.clone());
    Router::new()
        .route("/admin/insights", get(get_insights))
        .route("/admin/insights/topics", get(get_topic_performance))
        .layer(Extension(state))
        .layer(middleware::from_fn(require_auth))
}
