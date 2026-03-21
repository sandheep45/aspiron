use axum::{Extension, Json, extract::Query};
use serde::Deserialize;

use crate::entries::dtos::response::users::UserResponse;
use crate::services::users::state::UsersState;
use crate::setup::error::AppError;

#[derive(Deserialize)]
pub struct GetUserEmailParams {
    email: String,
}

pub async fn get_user_by_email(
    Extension(state): Extension<UsersState>,
    Query(params): Query<GetUserEmailParams>,
) -> Result<Json<UserResponse>, AppError> {
    state.user_service.get_user_by_email(&params.email).await
}
