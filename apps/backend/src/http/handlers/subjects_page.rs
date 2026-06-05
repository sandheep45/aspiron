use axum::Json;
use axum::extract::State;
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QuerySelect};
use uuid::Uuid;

use crate::entries::entities::{
    assessment_attempt, assessment_quiz, content_chapter, content_subject, content_topic,
    learning_recall_answer, learning_recall_session,
};
use crate::http::responses::subjects_page::{
    SubjectPageItem, SubjectSignal, SubjectSignalType, SubjectSummary,
};
use crate::setup::app::AppState;
use crate::setup::error::AppError;

async fn compute_avg_recall(
    db: &sea_orm::DatabaseConnection,
    topic_ids: Vec<Uuid>,
) -> Result<Option<f64>, AppError> {
    if topic_ids.is_empty() {
        return Ok(None);
    }

    let correct = learning_recall_answer::Entity::find()
        .inner_join(learning_recall_session::Entity)
        .filter(learning_recall_session::Column::TopicId.is_in(topic_ids.clone()))
        .filter(learning_recall_answer::Column::IsCorrect.eq(true))
        .count(db)
        .await
        .map_err(AppError::Database)? as f64;

    let total = learning_recall_answer::Entity::find()
        .inner_join(learning_recall_session::Entity)
        .filter(learning_recall_session::Column::TopicId.is_in(topic_ids))
        .count(db)
        .await
        .map_err(AppError::Database)? as f64;

    if total > 0.0 {
        Ok(Some(correct / total))
    } else {
        Ok(None)
    }
}

async fn compute_avg_accuracy(
    db: &sea_orm::DatabaseConnection,
    topic_ids: Vec<Uuid>,
) -> Result<Option<f64>, AppError> {
    if topic_ids.is_empty() {
        return Ok(None);
    }

    let quiz_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .select_only()
        .column(assessment_quiz::Column::Id)
        .filter(assessment_quiz::Column::TopicId.is_in(topic_ids))
        .into_tuple::<Uuid>()
        .all(db)
        .await
        .unwrap_or_default();

    if quiz_ids.is_empty() {
        return Ok(None);
    }

    let attempts = assessment_attempt::Entity::find()
        .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids))
        .all(db)
        .await
        .map_err(AppError::Database)?;

    if attempts.is_empty() {
        return Ok(None);
    }

    let total_score: i32 = attempts.iter().map(|a| a.score).sum();
    let count = attempts.len() as f64;
    let avg = (total_score as f64 / count) / 100.0;
    Ok(Some(avg))
}

fn derive_status(average_recall: Option<f64>, practice_accuracy: Option<f64>) -> String {
    let recall = average_recall.unwrap_or(1.0);
    let accuracy = practice_accuracy.unwrap_or(1.0);
    let min_score = recall.min(accuracy);
    if min_score < 0.5 {
        "Critical".to_string()
    } else if min_score < 0.7 {
        "Needs Attention".to_string()
    } else {
        "Healthy".to_string()
    }
}

pub async fn handler_get_subjects_page(
    State(app_state): State<AppState>,
) -> Result<Json<Vec<SubjectPageItem>>, AppError> {
    let db = &*app_state.db;

    let subjects = content_subject::Entity::find()
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let quiz_topic_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .select_only()
        .column(assessment_quiz::Column::TopicId)
        .distinct()
        .into_tuple::<Uuid>()
        .all(db)
        .await
        .unwrap_or_default();

    let mut result = Vec::new();
    for subject in subjects {
        let chapters = content_chapter::Entity::find()
            .filter(content_chapter::Column::SubjectId.eq(subject.id))
            .all(db)
            .await
            .map_err(AppError::Database)?;

        let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();
        let chapters_count = chapter_ids.len() as i64;

        let (total_topics, topic_ids) = if chapter_ids.is_empty() {
            (0i64, Vec::new())
        } else {
            let topics = content_topic::Entity::find()
                .filter(content_topic::Column::ChapterId.is_in(chapter_ids.clone()))
                .all(db)
                .await
                .map_err(AppError::Database)?;
            let ids: Vec<Uuid> = topics.iter().map(|t| t.id).collect();
            (topics.len() as i64, ids)
        };

        let topics_published = topic_ids
            .iter()
            .filter(|id| quiz_topic_ids.contains(id))
            .count() as i64;

        let coverage = if total_topics > 0 {
            (topics_published as f64 / total_topics as f64) * 100.0
        } else {
            0.0
        };

        let average_recall = compute_avg_recall(db, topic_ids.clone()).await?;
        let practice_accuracy = compute_avg_accuracy(db, topic_ids).await?;
        let status = derive_status(average_recall, practice_accuracy);

        result.push(SubjectPageItem {
            id: subject.id.to_string(),
            name: subject.name,
            chapters_count,
            topics_published,
            coverage,
            average_recall,
            practice_accuracy,
            status,
        });
    }

    Ok(Json(result))
}

pub async fn handler_get_subjects_page_summary(
    State(app_state): State<AppState>,
) -> Result<Json<SubjectSummary>, AppError> {
    let db = &*app_state.db;

    let total_subjects = content_subject::Entity::find()
        .count(db)
        .await
        .map_err(AppError::Database)? as i64;

    let total_topics = content_topic::Entity::find()
        .count(db)
        .await
        .map_err(AppError::Database)? as i64;

    let published_topics = assessment_quiz::Entity::find()
        .select_only()
        .column(assessment_quiz::Column::TopicId)
        .distinct()
        .into_tuple::<Uuid>()
        .all(db)
        .await
        .unwrap_or_default()
        .len() as i64;

    let topic_ids_with_recall: Vec<Uuid> = learning_recall_session::Entity::find()
        .select_only()
        .column(learning_recall_session::Column::TopicId)
        .distinct()
        .into_tuple::<Uuid>()
        .all(db)
        .await
        .unwrap_or_default();

    let mut topics_needing_attention = 0i64;
    for topic_id in &topic_ids_with_recall {
        let correct = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(*topic_id))
            .filter(learning_recall_answer::Column::IsCorrect.eq(true))
            .count(db)
            .await
            .unwrap_or(0) as f64;

        let total = learning_recall_answer::Entity::find()
            .inner_join(learning_recall_session::Entity)
            .filter(learning_recall_session::Column::TopicId.eq(*topic_id))
            .count(db)
            .await
            .unwrap_or(0) as f64;

        if total > 0.0 && (correct / total) < 0.6 {
            topics_needing_attention += 1;
        }
    }

    let subject_names: Vec<String> = content_subject::Entity::find()
        .select_only()
        .column(content_subject::Column::Name)
        .into_tuple::<String>()
        .all(db)
        .await
        .unwrap_or_default();

    let subject_list = if subject_names.is_empty() {
        "No subjects".to_string()
    } else {
        subject_names.join(", ")
    };

    let descriptions = vec![
        subject_list,
        format!("{} topics across {} subjects", total_topics, total_subjects),
        format!("{} topics published and available", published_topics),
        format!(
            "{} topics with low recall or accuracy",
            topics_needing_attention
        ),
    ];

    Ok(Json(SubjectSummary {
        total_subjects,
        total_topics,
        published_topics,
        topics_needing_attention,
        descriptions,
    }))
}

pub async fn handler_get_subjects_page_signals(
    State(app_state): State<AppState>,
) -> Result<Json<Vec<SubjectSignal>>, AppError> {
    let db = &*app_state.db;

    let subjects = content_subject::Entity::find()
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let quiz_topic_ids: Vec<Uuid> = assessment_quiz::Entity::find()
        .select_only()
        .column(assessment_quiz::Column::TopicId)
        .distinct()
        .into_tuple::<Uuid>()
        .all(db)
        .await
        .unwrap_or_default();

    let mut signals = Vec::new();

    for subject in &subjects {
        let chapters = content_chapter::Entity::find()
            .filter(content_chapter::Column::SubjectId.eq(subject.id))
            .all(db)
            .await
            .map_err(AppError::Database)?;

        let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();

        if chapter_ids.is_empty() {
            continue;
        }

        let topic_ids: Vec<Uuid> = content_topic::Entity::find()
            .select_only()
            .column(content_topic::Column::Id)
            .filter(content_topic::Column::ChapterId.is_in(chapter_ids))
            .into_tuple::<Uuid>()
            .all(db)
            .await
            .unwrap_or_default();

        if topic_ids.is_empty() {
            continue;
        }

        let published = topic_ids
            .iter()
            .filter(|id| quiz_topic_ids.contains(id))
            .count();

        let coverage_pct = if topic_ids.is_empty() {
            0.0
        } else {
            (published as f64 / topic_ids.len() as f64) * 100.0
        };

        let avg_recall = compute_avg_recall(db, topic_ids.clone()).await?;
        let avg_accuracy = compute_avg_accuracy(db, topic_ids).await?;

        if let Some(recall) = avg_recall {
            if recall < 0.5 {
                signals.push(SubjectSignal {
                    subject_name: subject.name.clone(),
                    message: format!("{} has fastest recall decay", subject.name,),
                    signal_type: SubjectSignalType::Negative,
                });
            } else if recall >= 0.8 {
                signals.push(SubjectSignal {
                    subject_name: subject.name.clone(),
                    message: format!("{} maintains most stable recall", subject.name,),
                    signal_type: SubjectSignalType::Positive,
                });
            }
        }

        if let Some(accuracy) = avg_accuracy
            && accuracy >= 0.8
        {
            signals.push(SubjectSignal {
                subject_name: subject.name.clone(),
                message: format!("{} has highest practice accuracy", subject.name,),
                signal_type: SubjectSignalType::Positive,
            });
        }

        if coverage_pct >= 80.0 {
            signals.push(SubjectSignal {
                subject_name: subject.name.clone(),
                message: format!(
                    "Content coverage improved significantly for {}",
                    subject.name,
                ),
                signal_type: SubjectSignalType::Positive,
            });
        }
    }

    // Deduplicate: keep first occurrence of each unique message
    let mut seen = std::collections::HashSet::new();
    signals.retain(|s| seen.insert(s.message.clone()));

    // Limit to 4 signals
    signals.truncate(4);

    Ok(Json(signals))
}
