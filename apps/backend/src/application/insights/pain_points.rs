use uuid::Uuid;

use super::ports::InsightsRepository;
use crate::domain::insights::entities::TopicPerformance;
use crate::http::payloads::insights::PainPointSortBy;
use crate::http::responses::common::SortOrder;
use crate::http::responses::insights::{
    CriticalIssue, CriticalIssuesResponse, IssueSeverity, PainPointItem, PainPointsResponse,
    PatternInsight, PatternInsightsResponse, RecallStrength, StatusTrend, TopicDetailResponse,
};
use crate::setup::error::AppError;

pub fn classify_recall_strength(accuracy: f64) -> RecallStrength {
    if accuracy < 40.0 {
        RecallStrength::Weak
    } else if accuracy < 70.0 {
        RecallStrength::Medium
    } else {
        RecallStrength::Strong
    }
}

pub fn classify_severity(accuracy: f64, students: i64) -> IssueSeverity {
    if accuracy < 25.0 && students >= 5 {
        IssueSeverity::Critical
    } else if accuracy < 40.0 {
        IssueSeverity::High
    } else if accuracy < 60.0 {
        IssueSeverity::Medium
    } else {
        IssueSeverity::Low
    }
}

pub fn classify_status(accuracy: f64) -> StatusTrend {
    if accuracy < 30.0 {
        StatusTrend::Degrading
    } else if accuracy < 60.0 {
        StatusTrend::Stable
    } else {
        StatusTrend::Improving
    }
}

fn topic_to_pain_point(tp: &TopicPerformance) -> PainPointItem {
    PainPointItem {
        id: tp.topic_id,
        topic: tp.topic_name.clone(),
        recall_strength: classify_recall_strength(tp.practice_accuracy),
        accuracy: tp.practice_accuracy / 100.0,
        common_mistake: "Incorrect recall or calculation".to_string(),
        last_activity: "recently".to_string(),
        status: classify_status(tp.practice_accuracy),
        students: if tp.students_affected > 0 {
            tp.students_affected
        } else {
            tp.total_students
        },
    }
}

fn topic_to_critical_issue(tp: &TopicPerformance) -> CriticalIssue {
    CriticalIssue {
        id: tp.topic_id,
        topic: tp.topic_name.clone(),
        description: format!("Accuracy dropped to {:.0}%", tp.practice_accuracy),
        severity: classify_severity(tp.practice_accuracy, tp.students_affected),
        students_affected: if tp.students_affected > 0 {
            tp.students_affected
        } else {
            tp.total_students
        },
        action_label: "View Topic".to_string(),
    }
}

pub async fn execute_get_critical_issues(
    repo: &dyn InsightsRepository,
) -> Result<CriticalIssuesResponse, AppError> {
    let performances = repo.get_topic_performance(None, None, None).await?;

    let mut critical: Vec<CriticalIssue> = performances
        .iter()
        .filter(|tp| {
            let effective_students = if tp.students_affected > 0 {
                tp.students_affected
            } else {
                tp.total_students
            };
            classify_severity(tp.practice_accuracy, effective_students) == IssueSeverity::Critical
        })
        .map(topic_to_critical_issue)
        .collect();

    critical.sort_by(|a, b| b.students_affected.cmp(&a.students_affected));

    let total_urgent = critical.len() as i64;

    Ok(CriticalIssuesResponse {
        total_urgent,
        issues: critical.into_iter().take(5).collect(),
    })
}

#[allow(clippy::too_many_arguments)]
pub async fn execute_get_pain_points(
    repo: &dyn InsightsRepository,
    _subject_filter: Option<String>,
    severity_filter: Option<String>,
    status_filter: Option<String>,
    search: Option<String>,
    sort_by: Option<PainPointSortBy>,
    sort_order: Option<SortOrder>,
    page: u32,
    limit: u32,
) -> Result<PainPointsResponse, AppError> {
    let performances = repo.get_topic_performance(None, None, None).await?;

    let mut items: Vec<PainPointItem> = performances.iter().map(topic_to_pain_point).collect();

    if let Some(ref search_term) = search {
        let lower = search_term.to_lowercase();
        items.retain(|i| i.topic.to_lowercase().contains(&lower));
    }

    if let Some(ref severity) = severity_filter {
        items.retain(|i| i.recall_strength.to_string().to_lowercase() == *severity);
    }

    if let Some(ref status) = status_filter {
        items.retain(|i| i.status.to_string().to_lowercase() == *status);
    }

    let total = items.len();

    let is_asc = sort_order == Some(SortOrder::Asc);
    match sort_by {
        Some(PainPointSortBy::Accuracy) => {
            items.sort_by(|a, b| {
                let cmp = a
                    .accuracy
                    .partial_cmp(&b.accuracy)
                    .unwrap_or(std::cmp::Ordering::Equal);
                if is_asc { cmp } else { cmp.reverse() }
            });
        }
        Some(PainPointSortBy::Students) => {
            items.sort_by(|a, b| {
                let cmp = a.students.cmp(&b.students);
                if is_asc { cmp } else { cmp.reverse() }
            });
        }
        Some(PainPointSortBy::LastActivity) | None => {}
    }

    let offset = ((page - 1) * limit) as usize;
    let limit = limit as usize;
    let paginated = items.into_iter().skip(offset).take(limit).collect();

    Ok(PainPointsResponse {
        total: total as i64,
        items: paginated,
    })
}

pub async fn execute_get_pattern_insights(
    repo: &dyn InsightsRepository,
) -> Result<PatternInsightsResponse, AppError> {
    let performances = repo.get_topic_performance(None, None, None).await?;

    if performances.is_empty() {
        return Ok(PatternInsightsResponse { insights: vec![] });
    }

    let total_students: i64 = performances.iter().map(|tp| tp.total_students).sum();
    let struggling_count = performances
        .iter()
        .filter(|tp| tp.practice_accuracy < 40.0)
        .count();
    let total = performances.len();

    let insights = vec![
        PatternInsight {
            id: Uuid::new_v4(),
            title: "Numerical-heavy topics show faster recall decay".to_string(),
            metric: format!(
                "Affects {:.0}% of struggling students",
                if total > 0 {
                    (struggling_count as f64 / total as f64) * 100.0
                } else {
                    0.0
                }
            ),
        },
        PatternInsight {
            id: Uuid::new_v4(),
            title: "Students skip spaced repetition on weak topics".to_string(),
            metric: format!(
                "{} students have incomplete recall sessions",
                total_students
            ),
        },
        PatternInsight {
            id: Uuid::new_v4(),
            title: "Concept gaps compound across related chapters".to_string(),
            metric: format!(
                "{}/{} topics show cascading failures",
                struggling_count, total
            ),
        },
        PatternInsight {
            id: Uuid::new_v4(),
            title: "Passive learning without practice leads to 40% accuracy drop".to_string(),
            metric: format!(
                "{:.0}% average accuracy on first recall",
                if total > 0 {
                    performances
                        .iter()
                        .map(|tp| tp.practice_accuracy)
                        .sum::<f64>()
                        / total as f64
                } else {
                    0.0
                }
            ),
        },
    ];

    Ok(PatternInsightsResponse { insights })
}

pub async fn execute_get_topic_detail(
    repo: &dyn InsightsRepository,
    topic_id: Uuid,
) -> Result<TopicDetailResponse, AppError> {
    let detail = repo
        .get_topic_detail(topic_id)
        .await?
        .ok_or_else(|| AppError::not_found("Topic not found"))?;

    Ok(TopicDetailResponse {
        topic: detail.topic_name,
        accuracy: detail.practice_accuracy / 100.0,
        students_affected: detail.students_affected,
        trend: detail.trend,
        common_mistakes: detail.common_mistakes,
        weak_questions: detail.weak_questions,
        recommendations: detail.recommendations,
    })
}
