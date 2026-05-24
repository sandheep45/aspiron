use std::sync::Arc;

use axum::{Router, middleware, routing::get};

use crate::application::insights::InsightsApplicationState;
use crate::application::insights::ports::{AuthorizationPort, InsightsRepository};
use crate::application::users::ports::UserRepository as UserDomainRepository;
use crate::application::users::service::UserService;
use crate::http::handlers::insights::{handler_get_insights, handler_get_topic_performance};
use crate::infra::auth::user_service_auth::UserServiceAuthAdapter;
use crate::infra::db::repositories::insights_repo::SeaOrmInsightsRepository;
use crate::infra::db::repositories::user_repo::SeaOrmUserDomainRepository;
use crate::middleware::auth::require_auth;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn InsightsRepository> =
        Arc::new(SeaOrmInsightsRepository::new(app_state.db.clone()));

    let user_repo: Arc<dyn UserDomainRepository> =
        Arc::new(SeaOrmUserDomainRepository::new(app_state.db.clone()));
    let user_service = UserService::new(user_repo);
    let auth: Arc<dyn AuthorizationPort> = Arc::new(UserServiceAuthAdapter::new(user_service));
    let insights_state = InsightsApplicationState::new(repo, auth);

    Router::new()
        .route("/admin/insights", get(handler_get_insights))
        .route("/admin/insights/topics", get(handler_get_topic_performance))
        .layer(axum::Extension(insights_state))
        .layer(middleware::from_fn(require_auth))
}
