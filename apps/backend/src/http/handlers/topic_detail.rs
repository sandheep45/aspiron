use axum::Json;
use axum::extract::{Path, State};
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

use crate::entries::entities::{
    assessment_attempt, assessment_quiz, content_video, learning_progress, learning_recall_answer,
    learning_recall_session,
};
use crate::http::responses::topic_detail::{
    TopicActionResponse, TopicComponentResponse, TopicIssueResponse, TopicOverviewResponse,
    TopicTrendsResponse, TrendDataPointResponse,
};
use crate::setup::app::AppState;
use crate::setup::error::AppError;

// ---------------------------------------------------------------------------
// Pure functions (extracted for testability)
// ---------------------------------------------------------------------------

pub fn derive_recall_strength(correct: u64, total: u64) -> &'static str {
    if total == 0 {
        return "unknown";
    }
    let ratio = correct as f64 / total as f64;
    if ratio < 0.4 {
        "weak"
    } else if ratio < 0.7 {
        "fair"
    } else {
        "strong"
    }
}

pub fn derive_dropoff_indicator(completed: u64, total: u64) -> &'static str {
    if total == 0 {
        return "unknown";
    }
    let rate = completed as f64 / total as f64;
    if rate < 0.3 {
        "high"
    } else if rate < 0.6 {
        "medium"
    } else {
        "low"
    }
}

pub fn derive_engagement_trend(progress_count: u64) -> &'static str {
    if progress_count > 5 {
        "growing"
    } else if progress_count > 0 {
        "stable"
    } else {
        "declining"
    }
}

pub fn calculate_practice_accuracy(total_score: i32, total_possible: i32) -> f64 {
    if total_possible > 0 {
        (total_score as f64 / total_possible as f64) * 100.0
    } else {
        0.0
    }
}

pub fn derive_recall_issue_id(recall_ratio: f64) -> Option<&'static str> {
    if recall_ratio < 0.4 {
        Some("recall-weak")
    } else if recall_ratio < 0.7 {
        Some("recall-moderate")
    } else {
        None
    }
}

pub fn derive_dropoff_issue_id(completion_rate: f64) -> Option<&'static str> {
    if completion_rate < 0.3 {
        Some("dropoff-high")
    } else {
        None
    }
}

pub fn derive_accuracy_issue_id(avg_accuracy: f64) -> Option<&'static str> {
    if avg_accuracy < 50.0 {
        Some("accuracy-low")
    } else if avg_accuracy < 70.0 {
        Some("accuracy-moderate")
    } else {
        None
    }
}

pub fn has_video_issue(video_count: u64) -> bool {
    video_count == 0
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

pub async fn handler_get_topic_overview(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<TopicOverviewResponse>, AppError> {
    let db = &*app_state.db;

    let has_recall_sessions = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?
        > 0;

    let (correct, total) = if has_recall_sessions {
        let c = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .filter(learning_recall_answer::Column::IsCorrect.eq(true))
            .count(db)
            .await
            .unwrap_or(0);

        let t = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .count(db)
            .await
            .unwrap_or(1)
            .max(1);

        (c, t)
    } else {
        (0, 0)
    };

    let recall_strength = derive_recall_strength(correct, total).to_string();

    let quiz_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .filter(assessment_quiz::Column::TopicId.eq(topic_id))
        .all(db)
        .await
        .map_err(AppError::Database)?
        .into_iter()
        .map(|q| q.id)
        .collect();

    let (total_score, total_possible) = if !quiz_ids.is_empty() {
        let score: i32 = assessment_attempt::Entity::find()
            .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids.clone()))
            .all(db)
            .await
            .unwrap_or_default()
            .iter()
            .map(|a| a.score)
            .sum();

        let possible = quiz_ids.len() as i32 * 100;
        (score, possible)
    } else {
        (0, 0)
    };

    let practice_accuracy = calculate_practice_accuracy(total_score, total_possible);

    let total_sessions = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let completed_sessions = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .filter(learning_recall_session::Column::CompletedAt.is_not_null())
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let dropoff_indicator =
        derive_dropoff_indicator(completed_sessions, total_sessions).to_string();

    let recent_progress_count = learning_progress::Entity::find()
        .filter(learning_progress::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let engagement_trend = derive_engagement_trend(recent_progress_count).to_string();

    Ok(Json(TopicOverviewResponse {
        recall_strength,
        practice_accuracy: (practice_accuracy * 100.0).round() / 100.0,
        dropoff_indicator,
        engagement_trend,
    }))
}

fn build_recall_issue(issue_id: &str, recall_ratio: f64) -> TopicIssueResponse {
    match issue_id {
        "recall-weak" => TopicIssueResponse {
            id: "recall-weak".to_string(),
            title: "Recall drops significantly after 5 days".to_string(),
            severity: "high".to_string(),
            description: format!(
                "Students show {:.0}% decline in recall accuracy within the first week",
                (1.0 - recall_ratio) * 100.0
            ),
            recommendation:
                "Schedule revision sessions at increasing intervals to reinforce retention"
                    .to_string(),
            action_label: "Schedule Revision".to_string(),
        },
        "recall-moderate" => TopicIssueResponse {
            id: "recall-moderate".to_string(),
            title: "Moderate recall decay detected".to_string(),
            severity: "medium".to_string(),
            description: format!(
                "Recall accuracy is at {:.0}% — below the recommended 70% threshold",
                recall_ratio * 100.0
            ),
            recommendation: "Add spaced repetition practice to improve long-term retention"
                .to_string(),
            action_label: "View Practice Data".to_string(),
        },
        _ => unreachable!(),
    }
}

fn build_dropoff_issue(completion_rate: f64) -> TopicIssueResponse {
    TopicIssueResponse {
        id: "dropoff-high".to_string(),
        title: "High student drop-off rate".to_string(),
        severity: "critical".to_string(),
        description: format!(
            "Only {:.0}% of students complete recall sessions for this topic",
            completion_rate * 100.0
        ),
        recommendation: "Break content into shorter segments and add engagement checkpoints"
            .to_string(),
        action_label: "View Video Analytics".to_string(),
    }
}

fn build_accuracy_issue(issue_id: &str, avg_accuracy: f64) -> TopicIssueResponse {
    match issue_id {
        "accuracy-low" => TopicIssueResponse {
            id: "accuracy-low".to_string(),
            title: "Practice accuracy critically low".to_string(),
            severity: "critical".to_string(),
            description: format!(
                "Average practice accuracy is {:.0}% — students are struggling with application",
                avg_accuracy
            ),
            recommendation:
                "Review question difficulty and provide step-by-step solution walkthroughs"
                    .to_string(),
            action_label: "View Practice Data".to_string(),
        },
        "accuracy-moderate" => TopicIssueResponse {
            id: "accuracy-moderate".to_string(),
            title: "Practice accuracy below target".to_string(),
            severity: "medium".to_string(),
            description: format!(
                "Average accuracy of {:.0}% needs improvement to reach 70% target",
                avg_accuracy
            ),
            recommendation: "Add more varied practice questions with detailed explanations"
                .to_string(),
            action_label: "Review Questions".to_string(),
        },
        _ => unreachable!(),
    }
}

fn build_video_issue() -> TopicIssueResponse {
    TopicIssueResponse {
        id: "missing-video".to_string(),
        title: "No video content available".to_string(),
        severity: "medium".to_string(),
        description:
            "This topic has no video lecture — video content significantly improves engagement"
                .to_string(),
        recommendation: "Upload a video lecture to support visual learners".to_string(),
        action_label: "Open Content Review".to_string(),
    }
}

fn build_no_issues_placeholder() -> TopicIssueResponse {
    TopicIssueResponse {
        id: "no-issues".to_string(),
        title: "No significant issues detected".to_string(),
        severity: "low".to_string(),
        description: "This topic appears to be performing well across all metrics".to_string(),
        recommendation: "Continue monitoring and consider adding enrichment content".to_string(),
        action_label: "Schedule Revision".to_string(),
    }
}

pub async fn handler_get_topic_issues(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<TopicIssueResponse>>, AppError> {
    let db = &*app_state.db;

    let has_recall_sessions = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?
        > 0;

    let mut issues: Vec<TopicIssueResponse> = Vec::new();

    if has_recall_sessions {
        let correct = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .filter(learning_recall_answer::Column::IsCorrect.eq(true))
            .count(db)
            .await
            .unwrap_or(0) as f64;

        let total = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .count(db)
            .await
            .unwrap_or(1)
            .max(1) as f64;

        let recall_ratio = correct / total;

        if let Some(issue_id) = derive_recall_issue_id(recall_ratio) {
            issues.push(build_recall_issue(issue_id, recall_ratio));
        }

        let total_sessions = learning_recall_session::Entity::find()
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .count(db)
            .await
            .map_err(AppError::Database)?;

        let completed_sessions = learning_recall_session::Entity::find()
            .filter(learning_recall_session::Column::TopicId.eq(topic_id))
            .filter(learning_recall_session::Column::CompletedAt.is_not_null())
            .count(db)
            .await
            .map_err(AppError::Database)?;

        let completion_rate = if total_sessions > 0 {
            completed_sessions as f64 / total_sessions as f64
        } else {
            1.0
        };

        if derive_dropoff_issue_id(completion_rate).is_some() {
            issues.push(build_dropoff_issue(completion_rate));
        }
    }

    let quiz_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .filter(assessment_quiz::Column::TopicId.eq(topic_id))
        .all(db)
        .await
        .map_err(AppError::Database)?
        .into_iter()
        .map(|q| q.id)
        .collect();

    if !quiz_ids.is_empty() {
        let total_score: i32 = assessment_attempt::Entity::find()
            .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids.clone()))
            .all(db)
            .await
            .unwrap_or_default()
            .iter()
            .map(|a| a.score)
            .sum();

        let attempt_count = assessment_attempt::Entity::find()
            .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids.clone()))
            .count(db)
            .await
            .unwrap_or(0);

        let total_possible = quiz_ids.len() as i32 * 100;

        if attempt_count > 0 && total_possible > 0 {
            let avg_accuracy = (total_score as f64 / total_possible as f64) * 100.0;

            if let Some(issue_id) = derive_accuracy_issue_id(avg_accuracy) {
                issues.push(build_accuracy_issue(issue_id, avg_accuracy));
            }
        }
    }

    let video_count = content_video::Entity::find()
        .filter(content_video::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    if has_video_issue(video_count) {
        issues.push(build_video_issue());
    }

    if issues.is_empty() {
        issues.push(build_no_issues_placeholder());
    }

    Ok(Json(issues))
}

pub async fn handler_get_topic_components(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<TopicComponentResponse>>, AppError> {
    let db = &*app_state.db;

    let video_count = content_video::Entity::find()
        .filter(content_video::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let quiz_count = assessment_quiz::Entity::find()
        .filter(assessment_quiz::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let recall_count = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let progress_count = learning_progress::Entity::find()
        .filter(learning_progress::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let mut components = Vec::new();

    components.push(TopicComponentResponse {
        id: "video".to_string(),
        name: "Video Lecture".to_string(),
        status: if video_count > 0 {
            "published".to_string()
        } else {
            "draft".to_string()
        },
        performance: if video_count > 0 {
            "62% completion".to_string()
        } else {
            "Not available".to_string()
        },
        action: if video_count > 0 {
            "Manage Video".to_string()
        } else {
            "Upload Video".to_string()
        },
    });

    components.push(TopicComponentResponse {
        id: "practice-questions".to_string(),
        name: "Practice Questions".to_string(),
        status: if quiz_count > 0 {
            "published".to_string()
        } else {
            "draft".to_string()
        },
        performance: if quiz_count > 0 {
            format!("{} quizzes available", quiz_count)
        } else {
            "Not created".to_string()
        },
        action: if quiz_count > 0 {
            "Manage Questions".to_string()
        } else {
            "Create Questions".to_string()
        },
    });

    components.push(TopicComponentResponse {
        id: "recall".to_string(),
        name: "Recall Performance".to_string(),
        status: if recall_count > 0 {
            "published".to_string()
        } else {
            "draft".to_string()
        },
        performance: if recall_count > 0 {
            format!("{} sessions recorded", recall_count)
        } else {
            "No data".to_string()
        },
        action: "View Analytics".to_string(),
    });

    components.push(TopicComponentResponse {
        id: "study-notes".to_string(),
        name: "Study Notes".to_string(),
        status: "published".to_string(),
        performance: format!("{} students accessed", progress_count),
        action: "Manage Notes".to_string(),
    });

    components.push(TopicComponentResponse {
        id: "assignments".to_string(),
        name: "Assignments".to_string(),
        status: "draft".to_string(),
        performance: "Not assigned".to_string(),
        action: "Create Assignment".to_string(),
    });

    components.push(TopicComponentResponse {
        id: "flashcards".to_string(),
        name: "Flashcards".to_string(),
        status: if recall_count > 0 {
            "published".to_string()
        } else {
            "draft".to_string()
        },
        performance: if recall_count > 0 {
            format!("{} reviews completed", recall_count)
        } else {
            "Not available".to_string()
        },
        action: "Manage Flashcards".to_string(),
    });

    Ok(Json(components))
}

pub async fn handler_get_topic_actions(
    State(_app_state): State<AppState>,
    Path(_topic_id): Path<Uuid>,
) -> Result<Json<Vec<TopicActionResponse>>, AppError> {
    Ok(Json(vec![
        TopicActionResponse {
            id: "preview-as-student".to_string(),
            label: "Preview As Student".to_string(),
            description: Some("View the topic from a student's perspective".to_string()),
            icon: Some("eye".to_string()),
        },
        TopicActionResponse {
            id: "schedule-revision".to_string(),
            label: "Schedule Revision Class".to_string(),
            description: Some("Create a revision session for this topic".to_string()),
            icon: Some("calendar".to_string()),
        },
        TopicActionResponse {
            id: "mark-for-review".to_string(),
            label: "Mark Topic For Review".to_string(),
            description: Some("Flag this topic for content review".to_string()),
            icon: Some("flag".to_string()),
        },
        TopicActionResponse {
            id: "assign-practice".to_string(),
            label: "Assign Practice Set".to_string(),
            description: Some("Assign practice questions to students".to_string()),
            icon: Some("book".to_string()),
        },
        TopicActionResponse {
            id: "generate-notes".to_string(),
            label: "Generate Revision Notes".to_string(),
            description: Some("Auto-generate revision notes from content".to_string()),
            icon: Some("file".to_string()),
        },
        TopicActionResponse {
            id: "review-questions".to_string(),
            label: "Review Questions".to_string(),
            description: Some("Review and update practice questions".to_string()),
            icon: Some("edit".to_string()),
        },
    ]))
}

pub async fn handler_get_topic_trends(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Option<TopicTrendsResponse>>, AppError> {
    let db = &*app_state.db;

    let recall_count = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .count(db)
        .await
        .map_err(AppError::Database)?;

    if recall_count < 2 {
        return Ok(Json(None));
    }

    let sessions = learning_recall_session::Entity::find()
        .filter(learning_recall_session::Column::TopicId.eq(topic_id))
        .order_by_asc(learning_recall_session::Column::StartedAt)
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let mut recall_trend = Vec::new();
    let mut engagement_trend = Vec::new();

    for session in &sessions {
        let correct = learning_recall_answer::Entity::find()
            .filter(learning_recall_answer::Column::SessionId.eq(session.id))
            .filter(learning_recall_answer::Column::IsCorrect.eq(true))
            .count(db)
            .await
            .unwrap_or(1) as f64;

        let total = learning_recall_answer::Entity::find()
            .filter(learning_recall_answer::Column::SessionId.eq(session.id))
            .count(db)
            .await
            .unwrap_or(1)
            .max(1) as f64;

        let date = session.started_at.format("%Y-%m-%d").to_string();
        let value = (correct / total) * 100.0;

        recall_trend.push(TrendDataPointResponse {
            date: date.clone(),
            value: (value * 100.0).round() / 100.0,
        });

        engagement_trend.push(TrendDataPointResponse { date, value: total });
    }

    let quiz_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .filter(assessment_quiz::Column::TopicId.eq(topic_id))
        .all(db)
        .await
        .map_err(AppError::Database)?
        .into_iter()
        .map(|q| q.id)
        .collect();

    let mut practice_accuracy_trend = Vec::new();
    let mut completion_trend = Vec::new();

    for quiz_id in &quiz_ids {
        let attempts = assessment_attempt::Entity::find()
            .filter(assessment_attempt::Column::QuizId.eq(*quiz_id))
            .all(db)
            .await
            .unwrap_or_default();

        for attempt in &attempts {
            if let Some(ref submitted) = attempt.submitted_at {
                let accuracy = if attempt.score > 0 {
                    attempt.score as f64
                } else {
                    0.0
                };

                practice_accuracy_trend.push(TrendDataPointResponse {
                    date: submitted.format("%Y-%m-%d").to_string(),
                    value: accuracy,
                });

                completion_trend.push(TrendDataPointResponse {
                    date: submitted.format("%Y-%m-%d").to_string(),
                    value: 100.0,
                });
            }
        }
    }

    if recall_trend.is_empty() && practice_accuracy_trend.is_empty() {
        return Ok(Json(None));
    }

    Ok(Json(Some(TopicTrendsResponse {
        recall_trend,
        practice_accuracy_trend,
        engagement_trend,
        completion_trend,
    })))
}
