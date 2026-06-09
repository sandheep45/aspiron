use axum::extract::{Path, Query};
use axum::{Extension, Json};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::application::content::topics_page_types::TopicWithMetrics;
use crate::application::content::{
    ContentApplicationState, get_topics_page_insights, get_topics_page_summary,
    get_topics_page_topics,
};
use crate::http::payloads::topics_page::TopicsQueryParams;
use crate::http::responses::topics_page::{
    InsightItemResponse, TopicItemResponse, TopicSummaryResponse,
};
use crate::setup::error::AppError;

pub fn apply_topics_sorting(
    items: Vec<TopicItemResponse>,
    params: &TopicsQueryParams,
) -> Vec<TopicItemResponse> {
    let mut items = items;

    if let Some(ref search) = params.search {
        let lower = search.to_lowercase();
        items.retain(|t| t.name.to_lowercase().contains(&lower));
    }

    if let Some(ref filter) = params.status_filter {
        items.retain(|t| t.status == *filter);
    }

    if let Some(ref filter) = params.content_status_filter {
        items.retain(|t| t.content_status == *filter);
    }

    if let Some(ref filter) = params.recall_filter {
        items.retain(|t| t.recall_strength == *filter);
    }

    if let Some(ref filter) = params.video_filter {
        let expected = filter == "true";
        items.retain(|t| t.video_available == expected);
    }

    if let Some(ref sort_by) = params.sort_by {
        let is_desc = params
            .sort_order
            .as_deref()
            .map(|o| o == "desc")
            .unwrap_or(true);

        match sort_by.as_str() {
            "accuracy" => {
                if is_desc {
                    items.sort_by(|a, b| {
                        b.practice_accuracy
                            .partial_cmp(&a.practice_accuracy)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });
                } else {
                    items.sort_by(|a, b| {
                        a.practice_accuracy
                            .partial_cmp(&b.practice_accuracy)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });
                }
            }
            "recall" => {
                items.sort_by(|a, b| {
                    let a_val = recall_sort_key(&a.recall_strength);
                    let b_val = recall_sort_key(&b.recall_strength);
                    if is_desc {
                        b_val.cmp(&a_val)
                    } else {
                        a_val.cmp(&b_val)
                    }
                });
            }
            "last_activity" => {
                if is_desc {
                    items.sort_by(|a, b| {
                        activity_sort_key(&b.last_activity)
                            .cmp(&activity_sort_key(&a.last_activity))
                    });
                } else {
                    items.sort_by(|a, b| {
                        activity_sort_key(&a.last_activity)
                            .cmp(&activity_sort_key(&b.last_activity))
                    });
                }
            }
            "status" => {
                if is_desc {
                    items.sort_by(|a, b| {
                        status_sort_key(&b.status).cmp(&status_sort_key(&a.status))
                    });
                } else {
                    items.sort_by(|a, b| {
                        status_sort_key(&a.status).cmp(&status_sort_key(&b.status))
                    });
                }
            }
            _ => {}
        }
    }

    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).max(1);
    let start = ((page - 1) * limit) as usize;
    let end = (start + limit as usize).min(items.len());

    if start < items.len() {
        items[start..end].to_vec()
    } else {
        Vec::new()
    }
}

pub async fn handler_get_topics_page_summary(
    Extension(state): Extension<ContentApplicationState>,
    Path(chapter_id): Path<Uuid>,
) -> Result<Json<TopicSummaryResponse>, AppError> {
    let summary =
        get_topics_page_summary::execute_get_topics_page_summary(&*state.repo, chapter_id).await?;

    Ok(Json(TopicSummaryResponse {
        chapter_name: summary.chapter_name,
        total_topics: summary.total_topics,
        published_topics: summary.published_topics,
        draft_topics: summary.draft_topics,
        weak_topics: summary.weak_topics,
    }))
}

pub async fn handler_get_topics_page_topics(
    Extension(state): Extension<ContentApplicationState>,
    Path(chapter_id): Path<Uuid>,
    Query(params): Query<TopicsQueryParams>,
) -> Result<Json<Vec<TopicItemResponse>>, AppError> {
    let topics =
        get_topics_page_topics::execute_get_topics_page_topics(&*state.repo, chapter_id).await?;

    let items: Vec<TopicItemResponse> = topics.into_iter().map(map_topic_to_item).collect();

    Ok(Json(apply_topics_sorting(items, &params)))
}

pub async fn handler_get_topics_page_insights(
    Extension(state): Extension<ContentApplicationState>,
    Path(chapter_id): Path<Uuid>,
) -> Result<Json<Vec<InsightItemResponse>>, AppError> {
    let insights =
        get_topics_page_insights::execute_get_topics_page_insights(&*state.repo, chapter_id)
            .await?;

    Ok(Json(
        insights
            .into_iter()
            .map(|i| InsightItemResponse {
                id: i.id,
                signal_type: i.signal_type,
                title: i.title,
                description: i.description,
            })
            .collect(),
    ))
}

fn map_topic_to_item(topic: TopicWithMetrics) -> TopicItemResponse {
    let recall_strength = topic.avg_recall.map_or_else(
        || "medium".to_string(),
        |r| {
            if r >= 0.8 {
                "strong".to_string()
            } else if r >= 0.5 {
                "medium".to_string()
            } else {
                "weak".to_string()
            }
        },
    );

    let practice_accuracy = topic
        .practice_accuracy
        .map(|a| (a * 100.0).round())
        .unwrap_or(0.0);

    let content_status = derive_content_status(topic.has_video, topic.has_quiz);
    let status = derive_topic_status(topic.avg_recall, topic.practice_accuracy);

    let last_activity = topic
        .last_activity_at
        .map(relative_time)
        .unwrap_or_else(|| "Never".to_string());

    TopicItemResponse {
        id: topic.id.to_string(),
        name: topic.name,
        content_status,
        video_available: topic.has_video,
        recall_strength,
        practice_accuracy,
        last_activity,
        status,
    }
}

pub fn derive_topic_status(avg_recall: Option<f64>, practice_accuracy: Option<f64>) -> String {
    let recall = avg_recall.unwrap_or(1.0);
    let accuracy = practice_accuracy.unwrap_or(1.0);
    let min_score = recall.min(accuracy);
    if min_score < 0.5 {
        "critical".to_string()
    } else if min_score < 0.7 {
        "needs_attention".to_string()
    } else {
        "healthy".to_string()
    }
}

pub fn derive_content_status(has_video: bool, has_quiz: bool) -> String {
    match (has_video, has_quiz) {
        (true, true) => "published".to_string(),
        (false, true) => "draft".to_string(),
        (true, false) => "review_pending".to_string(),
        (false, false) => "archived".to_string(),
    }
}

pub fn recall_sort_key(recall: &str) -> u8 {
    match recall {
        "strong" => 3,
        "medium" => 2,
        "weak" => 1,
        _ => 0,
    }
}

pub fn status_sort_key(status: &str) -> u8 {
    match status {
        "healthy" => 3,
        "needs_attention" => 2,
        "critical" => 1,
        _ => 0,
    }
}

fn activity_sort_key(activity: &str) -> i64 {
    if activity == "Never" {
        return 0;
    }
    let seconds = activity
        .split_once(' ')
        .and_then(|(num, _)| num.parse::<i64>().ok())
        .unwrap_or(0) as f64;

    if activity.contains("seconds") {
        seconds as i64
    } else if activity.contains("minutes") {
        (seconds * 60.0) as i64
    } else if activity.contains("hours") {
        (seconds * 3600.0) as i64
    } else if activity.contains("days") {
        (seconds * 86400.0) as i64
    } else if activity.contains("months") {
        (seconds * 86400.0 * 30.0) as i64
    } else if activity.contains("years") {
        (seconds * 86400.0 * 365.0) as i64
    } else {
        0
    }
}

fn relative_time(dt: DateTime<Utc>) -> String {
    let now = Utc::now();
    let duration = now.signed_duration_since(dt);

    let seconds = duration.num_seconds();
    let minutes = duration.num_minutes();
    let hours = duration.num_hours();
    let days = duration.num_days();

    if seconds < 60 {
        format!("{} seconds ago", seconds.max(0))
    } else if minutes < 60 {
        format!("{} minutes ago", minutes.max(1))
    } else if hours < 24 {
        format!("{} hours ago", hours.max(1))
    } else if days < 30 {
        format!("{} days ago", days.max(1))
    } else if days < 365 {
        format!("{} months ago", (days / 30).max(1))
    } else {
        format!("{} years ago", (days / 365).max(1))
    }
}
