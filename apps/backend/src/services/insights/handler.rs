use axum::{Extension, Json, extract::Query};
use uuid::Uuid;

use crate::{
    entries::{
        dtos::payload::insights::TopicPerformanceQueryParams,
        dtos::response::insights::TopicPerformanceResponse,
    },
    services::insights::InsightsState,
    setup::error::AppError,
};

pub async fn get_insights_handler(
    Extension(insights_state): Extension<InsightsState>,
    Query(params): Query<crate::entries::dtos::payload::insights::InsightsQueryParams>,
) -> Result<Json<crate::entries::dtos::response::insights::InsightsResponse>, AppError> {
    let insights = insights_state
        .insights_service
        .get_insights(&params)
        .await?;
    Ok(Json(insights))
}

pub async fn get_topic_performance_handler(
    Extension(insights_state): Extension<InsightsState>,
    user_id: Uuid,
    Query(params): Query<TopicPerformanceQueryParams>,
) -> Result<Json<TopicPerformanceResponse>, AppError> {
    let has_permission = insights_state
        .user_service
        .has_permission(user_id, "SYSTEM".to_string(), "VIEW_ANALYTICS".to_string())
        .await?
        .0;

    if !has_permission {
        return Err(AppError::Unauthorized(
            "Missing VIEW_ANALYTICS permission".to_string(),
        ));
    }

    let teacher_subject_ids = get_teacher_subjects(&user_id, &insights_state).await;

    let response = insights_state
        .insights_service
        .get_topic_performance(&params, teacher_subject_ids)
        .await?;

    Ok(Json(response))
}

async fn get_teacher_subjects(_user_id: &Uuid, _state: &InsightsState) -> Option<Vec<Uuid>> {
    None
}
