use axum::{Router, middleware, routing::get, routing::post};

use crate::middleware::auth::{PathMatch, register_exempt_paths, require_auth};
use crate::services::auth::handler::{
    authenticate_user, get_me, log_out, refresh_token, register_user,
};
use crate::services::auth::state::AuthState;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    register_exempt_paths(vec![
        PathMatch::exact("/auth/login"),
        PathMatch::exact("/auth/register-user"),
        PathMatch::exact("/auth/refresh-token"),
        PathMatch::exact("/auth/logout"),
    ]);

    let auth_state = AuthState::new(app_state.db.clone());

    Router::new()
        .route("/auth/login", post(authenticate_user))
        .route("/auth/refresh-token", get(refresh_token))
        .route("/auth/register-user", post(register_user))
        .route("/auth/me", get(get_me))
        .route("/auth/logout", post(log_out))
        .layer(axum::Extension(auth_state))
        .layer(middleware::from_fn(require_auth))
}
