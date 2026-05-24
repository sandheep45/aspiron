pub mod get_chapters;
pub mod get_offline_token;
pub mod get_subjects;
pub mod get_topic;
pub mod get_topics;
pub mod get_videos;
pub mod ports;

use std::sync::Arc;

#[derive(Clone)]
pub struct ContentApplicationState {
    pub repo: Arc<dyn ports::ContentRepository>,
}

impl ContentApplicationState {
    pub fn new(repo: Arc<dyn ports::ContentRepository>) -> Self {
        Self { repo }
    }
}
