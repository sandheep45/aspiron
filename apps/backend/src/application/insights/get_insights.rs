use chrono::{DateTime, Utc};

use super::ports::InsightsRepository;
use crate::domain::insights::entities::{InsightType, Severity};
use crate::http::payloads::insights::InsightsSortBy;
use crate::http::responses::common::{PaginationResponse, SortOrder};
use crate::http::responses::insights::{
    InsightSummary, InsightsResponse, SeverityCounts, TimeWindow, map_insights,
};
use crate::setup::error::AppError;

#[allow(clippy::too_many_arguments)]
pub async fn execute_get_insights(
    repo: &dyn InsightsRepository,
    insight_type_filter: Option<InsightType>,
    severity_filter: Option<Severity>,
    search: Option<String>,
    sort_by: Option<InsightsSortBy>,
    sort_order: Option<SortOrder>,
    page: u32,
    limit: u32,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
) -> Result<InsightsResponse, AppError> {
    let mut all_insights = vec![];

    if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::QuizReviewPending)
    {
        all_insights.extend(repo.get_quizzes_pending_review(start, end).await?);
    }

    if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::LowAttendance) {
        all_insights.extend(repo.get_low_attendance_sessions(start, end).await?);
    }

    if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::TopicDifficulty) {
        all_insights.extend(repo.get_difficult_topics(start, end).await?);
    }

    if insight_type_filter.is_none() || insight_type_filter == Some(InsightType::LowEngagement) {
        all_insights.extend(repo.get_low_engagement_topics(start, end).await?);
    }

    let total_before_filter = all_insights.len();
    let total_severity_counts = SeverityCounts::from_insights(&all_insights);

    if let Some(ref severity) = severity_filter {
        all_insights.retain(|i| i.severity == *severity);
    }

    if let Some(ref search) = search {
        let search_lower = search.to_lowercase();
        all_insights.retain(|i| {
            i.title.to_lowercase().contains(&search_lower)
                || i.description.to_lowercase().contains(&search_lower)
        });
    }

    let filtered_total = all_insights.len() as u64;
    let total_before_filters = total_before_filter as u64;

    let filtered_item = search
        .clone()
        .or_else(|| severity_filter.map(|s| format!("{:?}", s).to_lowercase()));

    let _summary = InsightSummary::with_severity_counts(
        total_before_filter,
        filtered_total as usize,
        filtered_item.clone(),
        total_severity_counts.clone(),
    );

    match sort_by {
        Some(InsightsSortBy::Severity) => {
            let is_asc = sort_order == Some(SortOrder::Asc);
            all_insights.sort_by(|a, b| {
                let severity_cmp = a.severity.cmp(&b.severity);
                if is_asc {
                    severity_cmp
                } else {
                    severity_cmp.reverse()
                }
            });
        }
        Some(InsightsSortBy::DetectedAt) | None => {
            let is_asc = sort_order == Some(SortOrder::Asc);
            all_insights.sort_by(|a, b| {
                let date_cmp = a.detected_at.cmp(&b.detected_at);
                if is_asc { date_cmp } else { date_cmp.reverse() }
            });
        }
    }

    let offset = ((page - 1) * limit) as usize;
    let limit = limit as usize;
    let paginated_domain: Vec<_> = all_insights.into_iter().skip(offset).take(limit).collect();
    let paginated_response = map_insights(paginated_domain);

    let total_pages = if filtered_total == 0 {
        0
    } else {
        ((filtered_total as f64) / limit as f64).ceil() as u32
    };

    let filtered_item_for_summary = search.or_else(|| {
        severity_filter
            .map(|s| format!("{:?}", s).to_lowercase())
            .or_else(|| insight_type_filter.map(|t| t.as_str().to_string()))
    });

    Ok(InsightsResponse {
        time_window: TimeWindow { start, end },
        insights: paginated_response,
        summary: InsightSummary::with_severity_counts(
            total_before_filter,
            filtered_total as usize,
            filtered_item_for_summary,
            total_severity_counts,
        ),
        pagination: PaginationResponse {
            page,
            limit: limit as u32,
            total: total_before_filters,
            filtered_total,
            total_pages,
        },
    })
}
