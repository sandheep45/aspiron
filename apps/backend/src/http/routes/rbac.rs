use std::sync::Arc;

use axum::{Router, routing::get};

use crate::application::rbac::RbacApplicationState;
use crate::application::rbac::ports::RbacRepository;
use crate::http::handlers::rbac::{
    handler_get_role, handler_get_role_permissions, handler_get_user_roles,
    handler_list_permissions, handler_list_roles,
};
use crate::infra::db::repositories::rbac_repo::SeaOrmRbacRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn RbacRepository> = Arc::new(SeaOrmRbacRepository::new(app_state.db.clone()));
    let rbac_state = RbacApplicationState::new(repo);

    Router::new()
        .route("/rbac/roles", get(handler_list_roles))
        .route("/rbac/roles/{role_id}", get(handler_get_role))
        .route(
            "/rbac/roles/{role_id}/permissions",
            get(handler_get_role_permissions),
        )
        .route("/rbac/permissions", get(handler_list_permissions))
        .route("/rbac/users/{user_id}/roles", get(handler_get_user_roles))
        .layer(axum::Extension(rbac_state))
}
