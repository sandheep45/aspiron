use std::sync::Arc;

use sea_orm::DatabaseConnection;

use super::repository::InsightsRepository;
use crate::entries::dtos::payload::insights::InsightsQueryParams;
use crate::entries::dtos::response::common::PaginationResponse;
use crate::entries::dtos::response::insights::{
    InsightSummary, InsightType, InsightsResponse, SeverityCounts, TimeWindow,
};
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
        params: &InsightsQueryParams,
    ) -> Result<InsightsResponse, AppError> {
        let (start, end) = params.get_time_window();
        let mut all_insights = vec![];

        let insight_type_filter = params.filter.insight_type;

        if insight_type_filter.is_none()
            || insight_type_filter == Some(InsightType::QuizReviewPending)
        {
            all_insights.extend(
                self.repository
                    .get_quizzes_pending_review(start, end)
                    .await?,
            );
        }

        if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::LowAttendance)
        {
            all_insights.extend(
                self.repository
                    .get_low_attendance_sessions(start, end)
                    .await?,
            );
        }

        if insight_type_filter.is_none()
            || insight_type_filter == Some(InsightType::TopicDifficulty)
        {
            all_insights.extend(self.repository.get_difficult_topics(start, end).await?);
        }

        if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::LowEngagement)
        {
            all_insights.extend(
                self.repository
                    .get_low_engagement_topics(start, end)
                    .await?,
            );
        }

        let total_before_filter = all_insights.len();

        let total_severity_counts = SeverityCounts::from_insights(&all_insights);

        if let Some(severity) = params.filter.severity {
            all_insights.retain(|i| i.severity == severity);
        }

        if let Some(search) = &params.pagination.search {
            let search_lower = search.to_lowercase();
            all_insights.retain(|i| {
                i.title.to_lowercase().contains(&search_lower)
                    || i.description.to_lowercase().contains(&search_lower)
            });
        }

        let filtered_total = all_insights.len() as u64;
        let total_before_filters = total_before_filter as u64;

        let filtered_item = params
            .pagination
            .search
            .clone()
            .map(Some)
            .unwrap_or_else(|| {
                params
                    .filter
                    .severity
                    .map(|s| format!("{:?}", s).to_lowercase())
            })
            .or_else(|| params.filter.insight_type.map(|t| t.as_str().to_string()));

        let summary = InsightSummary::with_severity_counts(
            total_before_filter,
            filtered_total as usize,
            filtered_item,
            total_severity_counts,
        );

        match params.sort.sort_by {
            Some(crate::entries::dtos::payload::insights::InsightsSortBy::Severity) => {
                let is_asc = params.sort.sort_order
                    == Some(crate::entries::dtos::response::common::SortOrder::Asc);
                all_insights.sort_by(|a, b| {
                    let severity_cmp = a.severity.cmp(&b.severity);
                    if is_asc {
                        severity_cmp
                    } else {
                        severity_cmp.reverse()
                    }
                });
            }
            Some(crate::entries::dtos::payload::insights::InsightsSortBy::DetectedAt) | None => {
                let is_asc = params.sort.sort_order
                    == Some(crate::entries::dtos::response::common::SortOrder::Asc);
                all_insights.sort_by(|a, b| {
                    let date_cmp = a.detected_at.cmp(&b.detected_at);
                    if is_asc { date_cmp } else { date_cmp.reverse() }
                });
            }
        }

        let offset = params.get_offset();
        let limit = params.get_limit();
        let paginated_insights: Vec<_> = all_insights
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect();

        let total_pages = if filtered_total == 0 {
            0
        } else {
            ((filtered_total as f64) / limit as f64).ceil() as u32
        };

        Ok(InsightsResponse {
            time_window: TimeWindow { start, end },
            insights: paginated_insights,
            summary,
            pagination: PaginationResponse {
                page: params.get_page(),
                limit,
                total: total_before_filters,
                filtered_total,
                total_pages,
            },
        })
    }
}
