pub mod assessment;
pub mod auth;
pub mod community;
pub mod content;
pub mod health;
pub mod insights;
pub mod learning;
pub mod live_session;
pub mod notification;
pub mod rbac;
pub mod users;

use crate::setup::app::AppState;

pub fn api_v1_router(app_state: &AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .merge(health::router(app_state))
        .merge(auth::router(app_state))
        .merge(users::router(app_state))
        .merge(rbac::router(app_state))
        .merge(assessment::router(app_state))
        .merge(community::router(app_state))
        .merge(content::router(app_state))
        .merge(learning::router(app_state))
        .merge(live_session::router(app_state))
        .merge(notification::router(app_state))
        .merge(insights::router(app_state))
}
