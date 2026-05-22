use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("User not found")]
    UserNotFound,
    #[error("Account is not active")]
    AccountNotActive,
}
