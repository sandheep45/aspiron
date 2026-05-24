use std::sync::Arc;

use axum::{Router, routing::get};

use crate::application::users::UsersApplicationState;
use crate::application::users::ports::UserRepository;
use crate::http::handlers::users::handler_get_user_by_email;
use crate::infra::db::repositories::user_repo::SeaOrmUserDomainRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn UserRepository> =
        Arc::new(SeaOrmUserDomainRepository::new(app_state.db.clone()));
    let users_state = UsersApplicationState::new(repo);

    Router::new()
        .route("/users", get(handler_get_user_by_email))
        .layer(axum::Extension(users_state))
}
