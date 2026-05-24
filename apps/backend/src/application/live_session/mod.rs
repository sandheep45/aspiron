pub mod ports;

use std::sync::Arc;

#[derive(Clone)]
pub struct LiveSessionApplicationState {
    pub repo: Arc<dyn ports::LiveSessionRepository>,
}

impl LiveSessionApplicationState {
    pub fn new(repo: Arc<dyn ports::LiveSessionRepository>) -> Self {
        Self { repo }
    }
}
