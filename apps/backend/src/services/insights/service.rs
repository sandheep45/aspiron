use std::sync::Arc;

use chrono::{DateTime, Utc};
use sea_orm::DatabaseConnection;

use super::repository::InsightsRepository;
use crate::entries::dtos::response::insights::{InsightSummary, InsightsResponse, TimeWindow};
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct InsightsService {
    repository: InsightsRepository,
}

impl InsightsService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self {
            repository: InsightsRepository::new(db),
        }
    }

    pub async fn get_insights(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<InsightsResponse, AppError> {
        let mut all_insights = vec![];

        all_insights.extend(
            self.repository
                .get_quizzes_pending_review(start, end)
                .await?,
        );
        all_insights.extend(
            self.repository
                .get_low_attendance_sessions(start, end)
                .await?,
        );
        all_insights.extend(self.repository.get_difficult_topics(start, end).await?);
        all_insights.extend(
            self.repository
                .get_low_engagement_topics(start, end)
                .await?,
        );

        let summary = InsightSummary::from_insights(&all_insights);

        Ok(InsightsResponse {
            time_window: TimeWindow { start, end },
            insights: all_insights,
            summary,
        })
    }
}
