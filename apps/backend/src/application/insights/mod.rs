pub mod get_insights;
pub mod get_topic_performance;
pub mod pain_points;
pub mod ports;

use std::sync::Arc;

use crate::application::insights::ports::{AuthorizationPort, InsightsRepository};

#[derive(Clone)]
pub struct InsightsApplicationState {
    pub repo: Arc<dyn InsightsRepository>,
    pub auth: Arc<dyn AuthorizationPort>,
}

impl InsightsApplicationState {
    pub fn new(repo: Arc<dyn InsightsRepository>, auth: Arc<dyn AuthorizationPort>) -> Self {
        Self { repo, auth }
    }
}
