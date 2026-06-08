use axum::extract::{Path, Query};
use axum::{Extension, Json};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::application::content::chapters_page_types::ChapterWithMetrics;
use crate::application::content::{
    ContentApplicationState, get_chapters_page_chapters, get_chapters_page_insights,
    get_chapters_page_summary,
};
use crate::http::payloads::chapters_page::ChaptersQueryParams;
use crate::http::responses::chapters_page::{
    ChapterItemResponse, ChapterSummaryResponse, InsightItemResponse,
};
use crate::setup::error::AppError;

pub async fn handler_get_chapters_page_summary(
    Extension(state): Extension<ContentApplicationState>,
    Path(subject_id): Path<Uuid>,
) -> Result<Json<ChapterSummaryResponse>, AppError> {
    let summary =
        get_chapters_page_summary::execute_get_chapters_page_summary(&*state.repo, subject_id)
            .await?;

    Ok(Json(ChapterSummaryResponse {
        subject_name: summary.subject_name,
        total_chapters: summary.total_chapters,
        published_topics: summary.published_topics,
        draft_topics: summary.draft_topics,
        chapters_needing_attention: summary.chapters_needing_attention,
    }))
}

pub async fn handler_get_chapters_page_chapters(
    Extension(state): Extension<ContentApplicationState>,
    Path(subject_id): Path<Uuid>,
    Query(params): Query<ChaptersQueryParams>,
) -> Result<Json<Vec<ChapterItemResponse>>, AppError> {
    let chapters =
        get_chapters_page_chapters::execute_get_chapters_page_chapters(&*state.repo, subject_id)
            .await?;

    let mut items: Vec<ChapterItemResponse> =
        chapters.into_iter().map(map_chapter_to_item).collect();

    // API-driven search
    if let Some(ref search) = params.search {
        let lower = search.to_lowercase();
        items.retain(|c| c.name.to_lowercase().contains(&lower));
    }

    // API-driven sort
    if let Some(ref sort_by) = params.sort_by {
        let is_desc = params
            .sort_order
            .as_deref()
            .map(|o| o == "desc")
            .unwrap_or(true);

        match sort_by.as_str() {
            "coverage" => {
                if is_desc {
                    items.sort_by(|a, b| {
                        b.coverage
                            .partial_cmp(&a.coverage)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });
                } else {
                    items.sort_by(|a, b| {
                        a.coverage
                            .partial_cmp(&b.coverage)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });
                }
            }
            "recall" => {
                items.sort_by(|a, b| {
                    let a_val = recall_sort_key(&a.avg_recall);
                    let b_val = recall_sort_key(&b.avg_recall);
                    if is_desc {
                        b_val.cmp(&a_val)
                    } else {
                        a_val.cmp(&b_val)
                    }
                });
            }
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

    // API-driven pagination
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).max(1);
    let start = ((page - 1) * limit) as usize;
    let end = (start + limit as usize).min(items.len());

    if start < items.len() {
        items = items[start..end].to_vec();
    } else {
        items = Vec::new();
    }

    Ok(Json(items))
}

pub async fn handler_get_chapters_page_insights(
    Extension(state): Extension<ContentApplicationState>,
    Path(subject_id): Path<Uuid>,
) -> Result<Json<Vec<InsightItemResponse>>, AppError> {
    let insights =
        get_chapters_page_insights::execute_get_chapters_page_insights(&*state.repo, subject_id)
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

fn map_chapter_to_item(chapter: ChapterWithMetrics) -> ChapterItemResponse {
    let avg_recall = chapter.avg_recall.map_or_else(
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

    let practice_accuracy = chapter
        .practice_accuracy
        .map(|a| (a * 100.0).round())
        .unwrap_or(0.0);

    let status = derive_chapter_status(chapter.avg_recall, chapter.practice_accuracy);

    let last_updated = chapter
        .last_activity_at
        .map(relative_time)
        .unwrap_or_else(|| "Never".to_string());

    ChapterItemResponse {
        id: chapter.id.to_string(),
        name: chapter.name,
        published_topics: chapter.published_topics,
        total_topics: chapter.total_topics,
        coverage: chapter.coverage.round(),
        avg_recall,
        practice_accuracy,
        status,
        last_updated,
    }
}

fn derive_chapter_status(avg_recall: Option<f64>, practice_accuracy: Option<f64>) -> String {
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

fn recall_sort_key(recall: &str) -> u8 {
    match recall {
        "strong" => 3,
        "medium" => 2,
        "weak" => 1,
        _ => 0,
    }
}

fn status_sort_key(status: &str) -> u8 {
    match status {
        "healthy" => 3,
        "needs_attention" => 2,
        "critical" => 1,
        _ => 0,
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
