use axum::{Extension, Json, extract::Query};
use serde::Deserialize;

use crate::entries::dtos::response::users::UserResponse;
use crate::services::users::state::UsersState;
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
pub async fn get_user_by_email(
    Extension(state): Extension<UsersState>,
    Query(params): Query<GetUserEmailParams>,
) -> Result<Json<UserResponse>, AppError> {
    state.user_service.get_user_by_email(&params.email).await
}
