use axum::Json as ResponseJson;
use axum::extract::Json;
use axum::extract::State;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use tracing::info;

use crate::entries::entities::user::Entity as UserEntity;
use crate::entries::payload::LoginRequest;
use crate::setup::app::AppState;

pub async fn authenticate_user(
    State(state): State<AppState>,
    Json(login_payload): Json<LoginRequest>,
) -> ResponseJson<bool> {
    let db = state.db.as_ref();

    match UserEntity::find()
        .filter(crate::entries::entities::user::Column::Email.eq(&login_payload.email))
        .one(db)
        .await
    {
        Ok(Some(user)) => {
            info!(
                "Authenticated user: id={}, email={}, is_active={}",
                user.id, user.email, user.is_active
            );
        }
        Ok(None) => {
            info!(
                "Login attempt for non-existent email: {}",
                login_payload.email
            );
        }
        Err(e) => {
            info!("Database error during login: {}", e);
        }
    }

    ResponseJson(true)
}

pub async fn get_me() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn refresh_token() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn register_user() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn log_out() -> ResponseJson<bool> {
    ResponseJson(true)
}
