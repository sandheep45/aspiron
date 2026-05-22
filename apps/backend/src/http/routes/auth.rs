use axum::{Router, middleware, routing::get, routing::post};

use crate::application::auth::AuthApplicationState;
use crate::application::auth::ports::{
    create_password_service, create_token_service, create_user_repo,
};
use crate::http::handlers::auth::{
    authenticate_user, get_me, log_out, refresh_token_handler, register_user,
};
use crate::middleware::auth::{PathMatch, register_exempt_paths, require_auth};
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    register_exempt_paths(vec![
        PathMatch::exact("/auth/login"),
        PathMatch::exact("/auth/register-user"),
        PathMatch::exact("/auth/refresh-token"),
        PathMatch::exact("/auth/logout"),
    ]);

    let user_repo = create_user_repo(app_state.db.clone());
    let token_service = create_token_service(
        app_state.config.jwt.secret.clone(),
        app_state.config.jwt.access_token_expiry_seconds,
        app_state.config.jwt.refresh_token_expiry_seconds,
    );
    let password_service = create_password_service();

    let auth_state = AuthApplicationState::new(
        user_repo,
        token_service,
        password_service,
        &app_state.config,
    );

    Router::new()
        .route("/auth/login", post(authenticate_user))
        .route("/auth/refresh-token", get(refresh_token_handler))
        .route("/auth/register-user", post(register_user))
        .route("/auth/me", get(get_me))
        .route("/auth/logout", post(log_out))
        .layer(axum::Extension(auth_state))
        .layer(middleware::from_fn(require_auth))
}
