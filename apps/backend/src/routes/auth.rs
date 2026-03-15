use axum::Extension;
use axum::{
    Router,
    routing::{get, post},
};

use crate::services::auth::{AuthState, authenticate_user, get_me, refresh_token, register_user};
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let state = AuthState::new(app_state.db.clone());
    Router::new()
        .route("/auth/login", post(authenticate_user))
        .route("/auth/refresh-token", get(refresh_token))
        .route("/auth/register-user", post(register_user))
        .route("/auth/me", get(get_me))
        .layer(Extension(state))
}
