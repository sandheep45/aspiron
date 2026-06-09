use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::application::rbac::RbacApplicationState;
use crate::http::responses::rbac::{PermissionResponse, RoleResponse, UserRoleResponse};
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/rbac/roles",
    tag = "RBAC",
    responses((status = 200, description = "List all roles"))
)]
pub async fn handler_list_roles(
    Extension(state): Extension<RbacApplicationState>,
) -> Result<Json<Vec<RoleResponse>>, AppError> {
    let roles = state.repo.get_all_roles().await?;
    Ok(Json(
        roles
            .into_iter()
            .map(|r| RoleResponse {
                id: r.id,
                name: r.name,
                display_name: r.display_name,
                description: r.description,
                is_system_role: r.is_system_role,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/rbac/roles/{role_id}",
    tag = "RBAC",
    responses((status = 200, description = "Get role by ID")),
    params(("role_id" = String, Path, description = "Role ID"))
)]
pub async fn handler_get_role(
    Extension(state): Extension<RbacApplicationState>,
    Path(role_id): Path<Uuid>,
) -> Result<Json<RoleResponse>, AppError> {
    let role = state.repo.get_role_by_id(role_id).await?;
    Ok(Json(RoleResponse {
        id: role.id,
        name: role.name,
        display_name: role.display_name,
        description: role.description,
        is_system_role: role.is_system_role,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/rbac/roles/{role_id}/permissions",
    tag = "RBAC",
    responses((status = 200, description = "Get permissions for a role")),
    params(("role_id" = String, Path, description = "Role ID"))
)]
pub async fn handler_get_role_permissions(
    Extension(state): Extension<RbacApplicationState>,
    Path(role_id): Path<Uuid>,
) -> Result<Json<Vec<PermissionResponse>>, AppError> {
    let perms = state.repo.get_permissions_for_role(role_id).await?;
    Ok(Json(
        perms
            .into_iter()
            .map(|p| PermissionResponse {
                id: p.id,
                name: p.name,
                resource_type: p.resource_type,
                action: p.action,
                description: p.description,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/rbac/permissions",
    tag = "RBAC",
    responses((status = 200, description = "List all permissions"))
)]
pub async fn handler_list_permissions(
    Extension(state): Extension<RbacApplicationState>,
) -> Result<Json<Vec<PermissionResponse>>, AppError> {
    let perms = state.repo.get_all_permissions().await?;
    Ok(Json(
        perms
            .into_iter()
            .map(|p| PermissionResponse {
                id: p.id,
                name: p.name,
                resource_type: p.resource_type,
                action: p.action,
                description: p.description,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/rbac/users/{user_id}/roles",
    tag = "RBAC",
    responses((status = 200, description = "Get roles for a user")),
    params(("user_id" = String, Path, description = "User ID"))
)]
pub async fn handler_get_user_roles(
    Extension(state): Extension<RbacApplicationState>,
    Path(user_id): Path<Uuid>,
) -> Result<Json<Vec<UserRoleResponse>>, AppError> {
    let roles = state.repo.get_user_roles(user_id).await?;
    Ok(Json(
        roles
            .into_iter()
            .map(|ur| UserRoleResponse {
                id: ur.id,
                user_id: ur.user_id,
                role_id: ur.role_id,
                is_active: ur.is_active,
            })
            .collect(),
    ))
}
