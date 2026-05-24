use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Quiz not found")]
    QuizNotFound,
    #[error("Question not found")]
    QuestionNotFound,
    #[error("Attempt not found")]
    AttemptNotFound,
    #[error("Attempt already submitted")]
    AttemptAlreadySubmitted,
}
