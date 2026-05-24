use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Subject not found")]
    SubjectNotFound,
    #[error("Chapter not found")]
    ChapterNotFound,
    #[error("Topic not found")]
    TopicNotFound,
    #[error("Video not found")]
    VideoNotFound,
}
