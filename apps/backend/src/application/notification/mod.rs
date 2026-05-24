pub mod ports;

use std::sync::Arc;

#[derive(Clone)]
pub struct NotificationApplicationState {
    pub repo: Arc<dyn ports::NotificationRepository>,
}

impl NotificationApplicationState {
    pub fn new(repo: Arc<dyn ports::NotificationRepository>) -> Self {
        Self { repo }
    }
}
