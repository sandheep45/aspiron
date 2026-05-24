use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Live session not found")]
    SessionNotFound,
    #[error("Recording not found")]
    RecordingNotFound,
}
