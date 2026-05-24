pub mod ports;

use std::sync::Arc;

#[derive(Clone)]
pub struct CommunityApplicationState {
    pub repo: Arc<dyn ports::CommunityRepository>,
}

impl CommunityApplicationState {
    pub fn new(repo: Arc<dyn ports::CommunityRepository>) -> Self {
        Self { repo }
    }
}
