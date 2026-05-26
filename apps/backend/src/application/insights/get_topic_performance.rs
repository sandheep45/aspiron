use uuid::Uuid;

use super::ports::InsightsRepository;
use crate::http::payloads::insights::TopicPerformanceSortBy;
use crate::http::responses::common::{PaginationResponse, SortOrder};
use crate::http::responses::insights::{TopicPerformanceResponse, map_topic_performance};
use crate::setup::error::AppError;

#[allow(clippy::too_many_arguments)]
pub async fn execute_get_topic_performance(
    repo: &dyn InsightsRepository,
    subject_id: Option<Uuid>,
    chapter_id: Option<Uuid>,
    topic_id: Option<Uuid>,
    teacher_subject_ids: Option<Vec<Uuid>>,
    search: Option<String>,
    sort_by: Option<TopicPerformanceSortBy>,
    sort_order: Option<SortOrder>,
    page: u32,
    limit: u32,
) -> Result<TopicPerformanceResponse, AppError> {
    let mut performances = repo
        .get_topic_performance(subject_id, chapter_id, topic_id)
        .await?;

    if let Some(ref subject_ids) = teacher_subject_ids {
        performances.retain(|p| subject_ids.contains(&p.subject_id));
    }

    performances.retain(|p| p.total_students > 0);

    if let Some(ref search) = search {
        let search_lower = search.to_lowercase();
        performances.retain(|p| {
            p.topic_name.to_lowercase().contains(&search_lower)
                || p.chapter_name.to_lowercase().contains(&search_lower)
                || p.subject_name.to_lowercase().contains(&search_lower)
        });
    }

    let total = performances.len();

    let is_asc = sort_order == Some(SortOrder::Asc);
    match sort_by {
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
                let cmp = a_val
                    .partial_cmp(&b_val)
                    .unwrap_or(std::cmp::Ordering::Equal);
                if is_asc { cmp } else { cmp.reverse() }
            });
        }
        Some(TopicPerformanceSortBy::RecallStrengthReflection) => {
            performances.sort_by(|a, b| {
                let a_val = a.recall_strength_reflection.unwrap_or(0.0);
                let b_val = b.recall_strength_reflection.unwrap_or(0.0);
                let cmp = a_val
                    .partial_cmp(&b_val)
                    .unwrap_or(std::cmp::Ordering::Equal);
                if is_asc { cmp } else { cmp.reverse() }
            });
        }
        Some(TopicPerformanceSortBy::PracticeAccuracy) => {
            performances.sort_by(|a, b| {
                let cmp = a
                    .practice_accuracy
                    .partial_cmp(&b.practice_accuracy)
                    .unwrap_or(std::cmp::Ordering::Equal);
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

    let offset = ((page - 1) * limit) as usize;
    let limit = limit as usize;
    let paginated_domain: Vec<_> = performances.into_iter().skip(offset).take(limit).collect();
    let paginated_response: Vec<_> = paginated_domain
        .into_iter()
        .map(map_topic_performance)
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        ((total as f64) / limit as f64).ceil() as u32
    };

    Ok(TopicPerformanceResponse {
        topics: paginated_response,
        pagination: PaginationResponse {
            page,
            limit: limit as u32,
            total: total as u64,
            filtered_total: total as u64,
            total_pages,
        },
    })
}
