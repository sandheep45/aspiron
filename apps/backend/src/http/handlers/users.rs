use axum::{Extension, Json, extract::Query};
use serde::Deserialize;

use crate::application::users::UsersApplicationState;
use crate::http::responses::users::UserResponse;
use crate::setup::error::AppError;

#[derive(Deserialize, utoipa::IntoParams)]
pub struct GetUserEmailParams {
    #[param(example = "barbara_turner.1@admin.aspiron")]
    email: String,
}

#[utoipa::path(
    get,
    path = "/api/v1/users",
    tag = "Users",
    responses(
        (status = 200, description = "Get user by email")
    ),
    params(
        ("email" = String, Query, description = "User email address")
    )
)]
pub async fn handler_get_user_by_email(
    Extension(state): Extension<UsersApplicationState>,
    Query(params): Query<GetUserEmailParams>,
) -> Result<Json<UserResponse>, AppError> {
    let user = state.user_service.get_user_by_email(&params.email).await?;
    Ok(Json(user))
}
