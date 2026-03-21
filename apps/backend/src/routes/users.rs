use axum::{Extension, Router, routing::get};

use crate::services::users::handler::get_user_by_email;
use crate::services::users::state::UsersState;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let state = UsersState::new(app_state.db.clone());
    Router::new()
        .route("/users", get(get_user_by_email))
        .layer(Extension(state))
}
