use axum::{Extension, Json, Router, extract::Query, routing::get};

use crate::entries::dtos::payload::insights::InsightsQueryParams;
use crate::entries::dtos::response::insights::InsightsResponse;
use crate::services::insights::{InsightsState, get_insights_handler};
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

pub fn router(app_state: &AppState) -> Router<AppState> {
    let state = InsightsState::new(app_state.db.clone());
    Router::new()
        .route("/admin/insights", get(get_insights))
        .layer(Extension(state))
}
