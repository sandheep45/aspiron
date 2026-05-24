use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Insights data not available")]
    DataNotAvailable,
}
