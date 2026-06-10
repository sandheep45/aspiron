use axum::extract::Path;
use axum::{Json, extract::State};
use sea_orm::{
    ActiveModelTrait, ActiveValue::NotSet, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter,
    QueryOrder, Set,
};
use uuid::Uuid;

use crate::entries::entities::learning_notes;
use crate::entries::entity_enums::content_owner_types::ContentOwnerTypeEnum;
use crate::entries::entity_enums::notes_content_type::NotesContentTypeEnum;
use crate::entries::entity_enums::trust_level::TrustLevelEnum;
use crate::http::payloads::notes_manager::{CreateReferencePayload, UpdateTeacherNotePayload};
use crate::http::responses::notes_manager::{
    AiNoteResponse, NotesOverviewResponse, ReferenceResponse, TeacherNoteResponse,
};
use crate::setup::app::AppState;
use crate::setup::error::AppError;

pub async fn handler_get_notes_overview(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<NotesOverviewResponse>, AppError> {
    let db = &*app_state.db;

    let teacher_notes = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::TEACHER))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let ai_notes = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::AI))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let references = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::ContentType.eq(NotesContentTypeEnum::EXTERNAL))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .count(db)
        .await
        .map_err(AppError::Database)?;

    let teacher_status = if teacher_notes.is_empty() {
        "draft".to_string()
    } else if teacher_notes
        .iter()
        .any(|n| n.trust_level == TrustLevelEnum::OFFICIAL)
    {
        "published".to_string()
    } else {
        "draft".to_string()
    };

    let ai_status = if ai_notes.is_empty() {
        "none".to_string()
    } else if ai_notes
        .iter()
        .any(|n| n.trust_level == TrustLevelEnum::OFFICIAL)
    {
        "published".to_string()
    } else {
        "pending_review".to_string()
    };

    Ok(Json(NotesOverviewResponse {
        teacher_notes_status: teacher_status,
        ai_notes_status: ai_status,
        external_references_count: references as i32,
        student_engagement: 84,
    }))
}

pub async fn handler_get_teacher_notes(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<TeacherNoteResponse>, AppError> {
    let db = &*app_state.db;

    let note = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::TEACHER))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .order_by_desc(learning_notes::Column::UpdatedAt)
        .one(db)
        .await
        .map_err(AppError::Database)?;

    match note {
        Some(n) => {
            let status = if n.trust_level == TrustLevelEnum::OFFICIAL {
                "published".to_string()
            } else if n.trust_level == TrustLevelEnum::AI {
                "pending_review".to_string()
            } else {
                "draft".to_string()
            };

            Ok(Json(TeacherNoteResponse {
                id: n.id.to_string(),
                content: n.content.unwrap_or_default(),
                status,
                updated_at: n.updated_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
            }))
        }
        None => Ok(Json(TeacherNoteResponse {
            id: String::new(),
            content: String::new(),
            status: "draft".to_string(),
            updated_at: String::new(),
        })),
    }
}

pub async fn handler_update_teacher_note(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
    Json(payload): Json<UpdateTeacherNotePayload>,
) -> Result<Json<TeacherNoteResponse>, AppError> {
    let db = &*app_state.db;

    let existing = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::TEACHER))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(AppError::Database)?;

    if let Some(note) = existing {
        let mut active: learning_notes::ActiveModel = note.into();
        active.content = sea_orm::Set(Some(payload.content));
        active.updated_at = sea_orm::Set(chrono::Utc::now().into());
        if let Some(status) = payload.status {
            active.trust_level = sea_orm::Set(match status.as_str() {
                "published" => TrustLevelEnum::OFFICIAL,
                "pending_review" => TrustLevelEnum::AI,
                _ => TrustLevelEnum::USER,
            });
        }
        let updated = active.update(db).await.map_err(AppError::Database)?;

        let status = if updated.trust_level == TrustLevelEnum::OFFICIAL {
            "published".to_string()
        } else if updated.trust_level == TrustLevelEnum::AI {
            "pending_review".to_string()
        } else {
            "draft".to_string()
        };

        Ok(Json(TeacherNoteResponse {
            id: updated.id.to_string(),
            content: updated.content.unwrap_or_default(),
            status,
            updated_at: updated.updated_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        }))
    } else {
        let now = chrono::Utc::now().into();
        let active = learning_notes::ActiveModel {
            id: Set(Uuid::new_v4()),
            topic_id: Set(topic_id),
            owner_type: Set(ContentOwnerTypeEnum::TEACHER),
            owner_id: NotSet,
            video_id: NotSet,
            video_timestamp: NotSet,
            content_type: Set(NotesContentTypeEnum::INLINE),
            content: Set(Some(payload.content)),
            external_url: NotSet,
            external_type: NotSet,
            is_public: Set(true),
            trust_level: Set(payload
                .status
                .map(|s| match s.as_str() {
                    "published" => TrustLevelEnum::OFFICIAL,
                    "pending_review" => TrustLevelEnum::AI,
                    _ => TrustLevelEnum::USER,
                })
                .unwrap_or(TrustLevelEnum::USER)),
            created_at: Set(now),
            updated_at: Set(now),
            deleted_at: NotSet,
        };
        let created = active.insert(db).await.map_err(AppError::Database)?;

        let status = if created.trust_level == TrustLevelEnum::OFFICIAL {
            "published".to_string()
        } else if created.trust_level == TrustLevelEnum::AI {
            "pending_review".to_string()
        } else {
            "draft".to_string()
        };

        Ok(Json(TeacherNoteResponse {
            id: created.id.to_string(),
            content: created.content.unwrap_or_default(),
            status,
            updated_at: created.updated_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        }))
    }
}

pub async fn handler_get_ai_notes(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<AiNoteResponse>>, AppError> {
    let db = &*app_state.db;

    let notes = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::AI))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .order_by_desc(learning_notes::Column::CreatedAt)
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let response: Vec<AiNoteResponse> = notes
        .into_iter()
        .map(|n| {
            let status = if n.trust_level == TrustLevelEnum::OFFICIAL {
                "approved".to_string()
            } else {
                "pending_review".to_string()
            };

            AiNoteResponse {
                id: n.id.to_string(),
                title: "AI Generated Notes".to_string(),
                content: n.content.unwrap_or_default(),
                status,
                generated_at: n.created_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
            }
        })
        .collect();

    Ok(Json(response))
}

pub async fn handler_approve_ai_notes(
    State(app_state): State<AppState>,
    Path((_topic_id, note_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<AiNoteResponse>, AppError> {
    let db = &*app_state.db;

    let note = learning_notes::Entity::find_by_id(note_id)
        .one(db)
        .await
        .map_err(AppError::Database)?
        .ok_or(AppError::NotFound("AI note not found".to_string()))?;

    let mut active: learning_notes::ActiveModel = note.into();
    active.trust_level = sea_orm::Set(TrustLevelEnum::OFFICIAL);
    active.updated_at = sea_orm::Set(chrono::Utc::now().into());
    let updated = active.update(db).await.map_err(AppError::Database)?;

    Ok(Json(AiNoteResponse {
        id: updated.id.to_string(),
        title: "AI Generated Notes".to_string(),
        content: updated.content.unwrap_or_default(),
        status: "approved".to_string(),
        generated_at: updated.created_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
    }))
}

pub async fn handler_get_references(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<ReferenceResponse>>, AppError> {
    let db = &*app_state.db;

    let refs = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::ContentType.eq(NotesContentTypeEnum::EXTERNAL))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .order_by_desc(learning_notes::Column::CreatedAt)
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let response: Vec<ReferenceResponse> = refs
        .into_iter()
        .map(|r| ReferenceResponse {
            id: r.id.to_string(),
            title: r.content.unwrap_or_default(),
            source: r.external_url.clone().unwrap_or_default(),
            reference_type: r.external_type.clone().unwrap_or_else(|| "URL".to_string()),
            url: r.external_url.unwrap_or_default(),
            visible: r.is_public,
        })
        .collect();

    Ok(Json(response))
}

pub async fn handler_create_reference(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
    Json(payload): Json<CreateReferencePayload>,
) -> Result<Json<ReferenceResponse>, AppError> {
    let db = &*app_state.db;

    let now = chrono::Utc::now().into();
    let title = payload.title.clone();
    let url = payload.url.clone();
    let ref_type = payload.reference_type.clone();
    let active = learning_notes::ActiveModel {
        id: Set(Uuid::new_v4()),
        topic_id: Set(topic_id),
        owner_type: Set(ContentOwnerTypeEnum::TEACHER),
        owner_id: NotSet,
        video_id: NotSet,
        video_timestamp: NotSet,
        content_type: Set(NotesContentTypeEnum::EXTERNAL),
        content: Set(Some(payload.title)),
        external_url: Set(Some(payload.url)),
        external_type: Set(Some(payload.reference_type)),
        is_public: Set(true),
        trust_level: Set(TrustLevelEnum::USER),
        created_at: Set(now),
        updated_at: Set(now),
        deleted_at: NotSet,
    };

    let _created = active.insert(db).await.map_err(AppError::Database)?;

    Ok(Json(ReferenceResponse {
        id: _created.id.to_string(),
        title,
        source: url.clone(),
        reference_type: ref_type,
        url,
        visible: true,
    }))
}

pub async fn handler_delete_reference(
    State(app_state): State<AppState>,
    Path((_topic_id, reference_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<()>, AppError> {
    let db = &*app_state.db;

    let reference = learning_notes::Entity::find_by_id(reference_id)
        .one(db)
        .await
        .map_err(AppError::Database)?
        .ok_or(AppError::NotFound("Reference not found".to_string()))?;

    let mut active: learning_notes::ActiveModel = reference.into();
    active.deleted_at = sea_orm::Set(Some(chrono::Utc::now().into()));
    active.update(db).await.map_err(AppError::Database)?;

    Ok(Json(()))
}

pub async fn handler_publish_teacher_notes(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<TeacherNoteResponse>, AppError> {
    let db = &*app_state.db;

    let note = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::TEACHER))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(AppError::Database)?;

    if let Some(n) = note {
        let mut active: learning_notes::ActiveModel = n.into();
        active.trust_level = sea_orm::Set(TrustLevelEnum::OFFICIAL);
        active.updated_at = sea_orm::Set(chrono::Utc::now().into());
        let updated = active.update(db).await.map_err(AppError::Database)?;

        Ok(Json(TeacherNoteResponse {
            id: updated.id.to_string(),
            content: updated.content.unwrap_or_default(),
            status: "published".to_string(),
            updated_at: updated.updated_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        }))
    } else {
        Err(AppError::NotFound(
            "No teacher notes found to publish".to_string(),
        ))
    }
}

pub async fn handler_unpublish_teacher_notes(
    State(app_state): State<AppState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<TeacherNoteResponse>, AppError> {
    let db = &*app_state.db;

    let note = learning_notes::Entity::find()
        .filter(learning_notes::Column::TopicId.eq(topic_id))
        .filter(learning_notes::Column::OwnerType.eq(ContentOwnerTypeEnum::TEACHER))
        .filter(learning_notes::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(AppError::Database)?;

    if let Some(n) = note {
        let mut active: learning_notes::ActiveModel = n.into();
        active.trust_level = sea_orm::Set(TrustLevelEnum::USER);
        active.updated_at = sea_orm::Set(chrono::Utc::now().into());
        let updated = active.update(db).await.map_err(AppError::Database)?;

        Ok(Json(TeacherNoteResponse {
            id: updated.id.to_string(),
            content: updated.content.unwrap_or_default(),
            status: "draft".to_string(),
            updated_at: updated.updated_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        }))
    } else {
        Err(AppError::NotFound(
            "No teacher notes found to unpublish".to_string(),
        ))
    }
}

pub async fn handler_toggle_reference_visibility(
    State(app_state): State<AppState>,
    Path((_topic_id, reference_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ReferenceResponse>, AppError> {
    let db = &*app_state.db;

    let reference = learning_notes::Entity::find_by_id(reference_id)
        .one(db)
        .await
        .map_err(AppError::Database)?
        .ok_or(AppError::NotFound("Reference not found".to_string()))?;

    let new_visibility = !reference.is_public;
    let mut active: learning_notes::ActiveModel = reference.into();
    active.is_public = sea_orm::Set(new_visibility);
    active.updated_at = sea_orm::Set(chrono::Utc::now().into());
    let updated = active.update(db).await.map_err(AppError::Database)?;

    Ok(Json(ReferenceResponse {
        id: updated.id.to_string(),
        title: updated.content.unwrap_or_default(),
        source: updated.external_url.clone().unwrap_or_default(),
        reference_type: updated.external_type.unwrap_or_else(|| "URL".to_string()),
        url: updated.external_url.unwrap_or_default(),
        visible: updated.is_public,
    }))
}
