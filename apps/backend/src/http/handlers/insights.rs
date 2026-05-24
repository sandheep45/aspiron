use axum::{Extension, Json, extract::Query};
use uuid::Uuid;

use crate::application::insights::InsightsApplicationState;
use crate::application::insights::{get_insights, get_topic_performance};
use crate::domain::insights::entities as domain;
use crate::http::payloads::insights::{InsightsQueryParams, TopicPerformanceQueryParams};
use crate::http::responses::insights::{InsightsResponse, TopicPerformanceResponse};
use crate::middleware::auth::AuthUser;
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
pub async fn handler_get_insights(
    Extension(state): Extension<InsightsApplicationState>,
    Query(params): Query<InsightsQueryParams>,
) -> Result<Json<InsightsResponse>, AppError> {
    let (start, end) = params.get_time_window();
    let result = get_insights::execute_get_insights(
        &*state.repo,
        params.filter.insight_type.map(map_insight_type),
        params.filter.severity.map(map_severity),
        params.pagination.search.clone(),
        params.sort.sort_by,
        params.sort.sort_order,
        params.get_page(),
        params.get_limit(),
        start,
        end,
    )
    .await?;
    Ok(Json(result))
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
pub async fn handler_get_topic_performance(
    Extension(state): Extension<InsightsApplicationState>,
    AuthUser(user_id): AuthUser,
    Query(params): Query<TopicPerformanceQueryParams>,
) -> Result<Json<TopicPerformanceResponse>, AppError> {
    let has_perm = state
        .auth
        .has_permission(user_id, "SYSTEM".to_string(), "VIEW_ANALYTICS".to_string())
        .await?;

    if !has_perm {
        return Err(AppError::unauthorized("Missing VIEW_ANALYTICS permission"));
    }

    let teacher_subject_ids = get_teacher_subjects(&user_id, &state).await;

    let result = get_topic_performance::execute_get_topic_performance(
        &*state.repo,
        params.get_subject_id(),
        params.get_chapter_id(),
        params.get_topic_id(),
        teacher_subject_ids,
        params.pagination.search.clone(),
        params.sort.sort_by,
        params.sort.sort_order,
        params.get_page(),
        params.get_limit(),
    )
    .await?;
    Ok(Json(result))
}

async fn get_teacher_subjects(
    _user_id: &Uuid,
    _state: &InsightsApplicationState,
) -> Option<Vec<Uuid>> {
    None
}

fn map_insight_type(t: crate::http::responses::insights::InsightType) -> domain::InsightType {
    match t {
        crate::http::responses::insights::InsightType::QuizReviewPending => {
            domain::InsightType::QuizReviewPending
        }
        crate::http::responses::insights::InsightType::LowAttendance => {
            domain::InsightType::LowAttendance
        }
        crate::http::responses::insights::InsightType::TopicDifficulty => {
            domain::InsightType::TopicDifficulty
        }
        crate::http::responses::insights::InsightType::LowEngagement => {
            domain::InsightType::LowEngagement
        }
        crate::http::responses::insights::InsightType::SystemAlert => {
            domain::InsightType::SystemAlert
        }
    }
}

fn map_severity(s: crate::http::responses::insights::Severity) -> domain::Severity {
    match s {
        crate::http::responses::insights::Severity::Danger => domain::Severity::Danger,
        crate::http::responses::insights::Severity::Success => domain::Severity::Success,
        crate::http::responses::insights::Severity::Neutral => domain::Severity::Neutral,
        crate::http::responses::insights::Severity::Warning => domain::Severity::Warning,
        crate::http::responses::insights::Severity::Info => domain::Severity::Info,
    }
}
