pub mod assessment;
pub mod auth;
pub mod community;
pub mod content;
pub mod health;
pub mod learning;
pub mod live_session;
pub mod notification;
pub mod rbac;
pub mod users;

pub fn api_v1_router() -> axum::Router {
    axum::Router::new()
        .merge(health::router())
        .merge(auth::router())
        .merge(users::router())
        .merge(rbac::router())
        .merge(assessment::router())
        .merge(community::router())
        .merge(content::router())
        .merge(learning::router())
        .merge(live_session::router())
        .merge(notification::router())
}
