pub mod create_note;
pub mod delete_note;
pub mod get_all_notes;
pub mod get_progress;
pub mod get_recall_result;
pub mod get_teachers_notes;
pub mod ports;
pub mod start_recall_session;
pub mod submit_recall_answer;
pub mod update_note;
pub mod update_progress;

use std::sync::Arc;

#[derive(Clone)]
pub struct LearningApplicationState {
    pub repo: Arc<dyn ports::LearningRepository>,
}

impl LearningApplicationState {
    pub fn new(repo: Arc<dyn ports::LearningRepository>) -> Self {
        Self { repo }
    }
}
