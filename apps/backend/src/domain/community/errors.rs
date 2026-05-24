use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Thread not found")]
    ThreadNotFound,
    #[error("Post not found")]
    PostNotFound,
}
