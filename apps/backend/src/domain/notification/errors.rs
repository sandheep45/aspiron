use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Notification not found")]
    NotificationNotFound,
    #[error("Notification event not found")]
    EventNotFound,
}
