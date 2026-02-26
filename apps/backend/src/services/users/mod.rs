use std::sync::Arc;

use axum::{Extension, Json, extract::Query};
use serde::Deserialize;

use crate::entries::dtos::response::users::UserResponse;
use crate::setup::error::AppError;

pub mod repository;
pub mod service;

pub use repository::*;
pub use service::*;

#[derive(Deserialize)]
pub struct GetUserEmailParams {
    email: String,
}

#[derive(Clone)]
pub struct UsersState {
    pub user_service: UserService,
}

impl UsersState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            user_service: UserService::new(db),
        }
    }
}

pub async fn get_user_by_email(
    Extension(state): Extension<UsersState>,
    Query(params): Query<GetUserEmailParams>,
) -> Result<Json<UserResponse>, AppError> {
    state.user_service.get_user_by_email(&params.email).await
}
