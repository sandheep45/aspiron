use crate::setup::error::AppError;

pub fn role_not_found() -> AppError {
    AppError::not_found("Role not found")
}

pub fn permission_not_found() -> AppError {
    AppError::not_found("Permission not found")
}

pub fn user_role_not_found() -> AppError {
    AppError::not_found("User role assignment not found")
}

pub fn duplicate_role_assignment() -> AppError {
    AppError::validation("User already has this role assigned")
}
