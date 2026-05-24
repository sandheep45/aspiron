use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Note not found")]
    NoteNotFound,
    #[error("Recall session not found")]
    RecallSessionNotFound,
    #[error("Progress record not found")]
    ProgressNotFound,
    #[error("Recall session already completed")]
    SessionAlreadyCompleted,
    #[error("Invalid progress value: {0}")]
    InvalidProgress(i32),
}
