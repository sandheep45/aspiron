pub mod create_attempt;
pub mod get_attempt_results;
pub mod get_questions;
pub mod get_quiz;
pub mod get_quizzes;
pub mod ports;
pub mod submit_attempt;

use std::sync::Arc;

#[derive(Clone)]
pub struct AssessmentApplicationState {
    pub repo: Arc<dyn ports::AssessmentRepository>,
}

impl AssessmentApplicationState {
    pub fn new(repo: Arc<dyn ports::AssessmentRepository>) -> Self {
        Self { repo }
    }
}
