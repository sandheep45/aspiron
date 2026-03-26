use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use super::repository::InsightsRepository;
use crate::entries::dtos::payload::insights::{
    InsightsQueryParams, TopicPerformanceQueryParams, TopicPerformanceSortBy,
};
use crate::entries::dtos::response::common::{PaginationResponse, SortOrder};
use crate::entries::dtos::response::insights::{
    InsightSummary, InsightType, InsightsResponse, SeverityCounts, TimeWindow,
    TopicPerformanceResponse,
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

    pub async fn get_topic_performance(
        &self,
        params: &TopicPerformanceQueryParams,
        teacher_subject_ids: Option<Vec<Uuid>>,
    ) -> Result<TopicPerformanceResponse, AppError> {
        let mut performances = self
            .repository
            .get_topic_performance(
                params.get_subject_id(),
                params.get_chapter_id(),
                params.get_topic_id(),
            )
            .await?;

        if let Some(subject_ids) = teacher_subject_ids {
            performances.retain(|p| {
                subject_ids
                    .iter()
                    .any(|sid| p.subject_name == sid.to_string())
            });
        }

        if let Some(search) = &params.pagination.search {
            let search_lower = search.to_lowercase();
            performances.retain(|p| {
                p.topic_name.to_lowercase().contains(&search_lower)
                    || p.chapter_name.to_lowercase().contains(&search_lower)
                    || p.subject_name.to_lowercase().contains(&search_lower)
            });
        }

        let total = performances.len();

        let is_asc = params.sort.sort_order == Some(SortOrder::Asc);
        match params.sort.sort_by {
            Some(TopicPerformanceSortBy::TopicName) => {
                performances.sort_by(|a, b| {
                    let cmp = a.topic_name.cmp(&b.topic_name);
                    if is_asc { cmp } else { cmp.reverse() }
                });
            }
            Some(TopicPerformanceSortBy::RecallStrengthMcq) => {
                performances.sort_by(|a, b| {
                    let a_val = a.recall_strength_mcq.unwrap_or(0.0);
                    let b_val = b.recall_strength_mcq.unwrap_or(0.0);
                    let cmp = a_val.partial_cmp(&b_val).unwrap();
                    if is_asc { cmp } else { cmp.reverse() }
                });
            }
            Some(TopicPerformanceSortBy::RecallStrengthReflection) => {
                performances.sort_by(|a, b| {
                    let a_val = a.recall_strength_reflection.unwrap_or(0.0);
                    let b_val = b.recall_strength_reflection.unwrap_or(0.0);
                    let cmp = a_val.partial_cmp(&b_val).unwrap();
                    if is_asc { cmp } else { cmp.reverse() }
                });
            }
            Some(TopicPerformanceSortBy::PracticeAccuracy) => {
                performances.sort_by(|a, b| {
                    let cmp = a
                        .practice_accuracy
                        .partial_cmp(&b.practice_accuracy)
                        .unwrap();
                    if is_asc { cmp } else { cmp.reverse() }
                });
            }
            Some(TopicPerformanceSortBy::StudentsAffected) => {
                performances.sort_by(|a, b| {
                    let cmp = a.students_affected.cmp(&b.students_affected);
                    if is_asc { cmp } else { cmp.reverse() }
                });
            }
            None => {}
        }

        let offset = params.get_offset();
        let limit = params.get_limit();
        let paginated: Vec<_> = performances
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect();

        let total_pages = if total == 0 {
            0
        } else {
            ((total as f64) / limit as f64).ceil() as u32
        };

        Ok(TopicPerformanceResponse {
            topics: paginated,
            pagination: PaginationResponse {
                page: params.get_page(),
                limit,
                total: total as u64,
                filtered_total: total as u64,
                total_pages,
            },
        })
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
