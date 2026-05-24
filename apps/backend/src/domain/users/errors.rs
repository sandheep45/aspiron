use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("User not found")]
    UserNotFound,
    #[error("Invalid permission")]
    InvalidPermission,
}
