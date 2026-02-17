use axum::{
    Router,
    routing::{get, post},
};

use crate::services::auth::{authenticate_user, get_me, refresh_token, register_user};
use crate::setup::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/login", post(authenticate_user))
        .route("/auth/refresh-token", get(refresh_token))
        .route("/auth/register-user", get(register_user))
        .route("/auth/me", get(get_me))
}
