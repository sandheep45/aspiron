use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::application::learning::ports::find_correct_answer_index;
use crate::application::learning::{
    LearningApplicationState, create_note, delete_note, get_all_notes, get_progress,
    get_recall_result, get_teachers_notes, start_recall_session, submit_recall_answer, update_note,
    update_progress,
};
use crate::http::payloads::learning::{
    CreateNoteRequest, StartRecallRequest, SubmitRecallAnswerRequest, UpdateNoteRequest,
    UpdateProgressRequest,
};
use crate::http::responses::learning::{
    NoteResponse, ProgressResponse, RecallQuestionResponse, RecallResultResponse,
    RecallSessionResponse,
};
use crate::middleware::auth::AuthUser;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/notes",
    tag = "Learning",
    responses(
        (status = 200, description = "Get all notes for the authenticated user")
    )
)]
pub async fn handler_get_all_notes(
    Extension(state): Extension<LearningApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<NoteResponse>>, AppError> {
    let notes = get_all_notes::execute_get_all_notes(&*state.repo, auth_user.0).await?;
    Ok(Json(notes.into_iter().map(map_note_to_response).collect()))
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/notes/official",
    tag = "Learning",
    responses(
        (status = 200, description = "Get teacher's notes for a topic")
    ),
    params(
        ("topic_id" = String, Path, description = "Topic ID")
    )
)]
pub async fn handler_get_teachers_notes(
    Extension(state): Extension<LearningApplicationState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<NoteResponse>>, AppError> {
    let notes = get_teachers_notes::execute_get_teachers_notes(&*state.repo, topic_id).await?;
    Ok(Json(notes.into_iter().map(map_note_to_response).collect()))
}

#[utoipa::path(
    post,
    path = "/api/v1/notes",
    tag = "Learning",
    responses(
        (status = 200, description = "Create a note")
    )
)]
pub async fn handler_create_note(
    Extension(state): Extension<LearningApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateNoteRequest>,
) -> Result<Json<NoteResponse>, AppError> {
    let note = create_note::execute_create_note(
        &*state.repo,
        auth_user.0,
        payload.topic_id,
        payload.title,
        payload.content,
    )
    .await?;
    Ok(Json(map_note_to_response(note)))
}

#[utoipa::path(
    patch,
    path = "/api/v1/notes/{note_id}",
    tag = "Learning",
    responses(
        (status = 200, description = "Update a note")
    ),
    params(
        ("note_id" = String, Path, description = "Note ID")
    )
)]
pub async fn handler_update_note(
    Extension(state): Extension<LearningApplicationState>,
    Path(note_id): Path<Uuid>,
    Json(payload): Json<UpdateNoteRequest>,
) -> Result<Json<NoteResponse>, AppError> {
    let note =
        update_note::execute_update_note(&*state.repo, note_id, payload.title, payload.content)
            .await?;
    Ok(Json(map_note_to_response(note)))
}

#[utoipa::path(
    delete,
    path = "/api/v1/notes/{note_id}",
    tag = "Learning",
    responses(
        (status = 200, description = "Delete a note")
    ),
    params(
        ("note_id" = String, Path, description = "Note ID")
    )
)]
pub async fn handler_delete_note(
    Extension(state): Extension<LearningApplicationState>,
    Path(note_id): Path<Uuid>,
) -> Result<Json<()>, AppError> {
    delete_note::execute_delete_note(&*state.repo, note_id).await?;
    Ok(Json(()))
}

#[utoipa::path(
    post,
    path = "/api/v1/progress/update",
    tag = "Learning",
    responses(
        (status = 200, description = "Update learning progress")
    )
)]
pub async fn handler_update_progress(
    Extension(state): Extension<LearningApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<UpdateProgressRequest>,
) -> Result<Json<ProgressResponse>, AppError> {
    let progress = update_progress::execute_update_progress(
        &*state.repo,
        auth_user.0,
        payload.topic_id,
        payload.progress_percent,
    )
    .await?;
    Ok(Json(ProgressResponse {
        id: progress.id,
        user_id: progress.user_id,
        topic_id: progress.topic_id,
        progress_percent: progress.progress_percent.value(),
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/progress/summary",
    tag = "Learning",
    responses(
        (status = 200, description = "Get progress summary")
    )
)]
pub async fn handler_get_progress_summary(
    Extension(state): Extension<LearningApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<ProgressResponse>, AppError> {
    let progress =
        get_progress::execute_get_progress(&*state.repo, auth_user.0, Uuid::default()).await?;
    Ok(Json(ProgressResponse {
        id: progress.id,
        user_id: progress.user_id,
        topic_id: progress.topic_id,
        progress_percent: progress.progress_percent.value(),
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/recall/start",
    tag = "Learning",
    responses(
        (status = 200, description = "Start a recall session")
    )
)]
pub async fn handler_start_recall(
    Extension(state): Extension<LearningApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<StartRecallRequest>,
) -> Result<Json<RecallSessionResponse>, AppError> {
    let session = start_recall_session::execute_start_recall_session(
        &*state.repo,
        auth_user.0,
        payload.topic_id,
    )
    .await?;
    Ok(Json(RecallSessionResponse {
        id: session.id,
        user_id: session.user_id,
        topic_id: session.topic_id,
        status: session.status.as_str().to_string(),
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/recall/{session_id}/mcqs",
    tag = "Learning",
    responses(
        (status = 200, description = "Get recall MCQs for a session")
    ),
    params(
        ("session_id" = String, Path, description = "Session ID")
    )
)]
pub async fn handler_get_recall_mcq_by_session_id(
    Extension(state): Extension<LearningApplicationState>,
    Path(session_id): Path<Uuid>,
) -> Result<Json<Vec<RecallQuestionResponse>>, AppError> {
    let session = get_recall_result::execute_get_recall_result(&*state.repo, session_id).await?;
    let questions = state
        .repo
        .get_quiz_questions_for_topic(session.topic_id)
        .await?;

    let response: Vec<RecallQuestionResponse> = questions
        .into_iter()
        .map(|q| {
            let options = q
                .options
                .as_object()
                .map(|obj| {
                    let mut pairs: Vec<_> = obj.iter().collect();
                    pairs.sort_by(|a, b| a.0.cmp(b.0));
                    pairs
                        .into_iter()
                        .map(|(_, v)| v.as_str().unwrap_or("").to_string())
                        .collect()
                })
                .unwrap_or_default();

            let correct_idx = find_correct_answer_index(&q.options, &q.correct_answer).unwrap_or(0);

            RecallQuestionResponse {
                id: q.id,
                question: q.question,
                options,
                correct_answer: correct_idx,
            }
        })
        .collect();

    Ok(Json(response))
}

#[utoipa::path(
    post,
    path = "/api/v1/recall/{session_id}/mcqs/submit",
    tag = "Learning",
    responses(
        (status = 200, description = "Submit recall MCQ answers")
    ),
    params(
        ("session_id" = String, Path, description = "Session ID")
    )
)]
pub async fn handler_submit_recall_mcq(
    Extension(state): Extension<LearningApplicationState>,
    Path(session_id): Path<Uuid>,
    Json(payload): Json<Vec<SubmitRecallAnswerRequest>>,
) -> Result<Json<RecallResultResponse>, AppError> {
    for answer in &payload {
        submit_recall_answer::execute_submit_recall_answer(
            &*state.repo,
            session_id,
            answer.question_id,
            answer.selected_option,
        )
        .await?;
    }

    state.repo.complete_recall_session(session_id).await?;

    let answers = state.repo.get_recall_answers_by_session(session_id).await?;
    let total_questions = answers.len();
    let correct_answers = answers.iter().filter(|a| a.is_correct).count();
    let score_percent = if total_questions > 0 {
        (correct_answers as f64 / total_questions as f64 * 100.0).round() as i32
    } else {
        0
    };

    Ok(Json(RecallResultResponse {
        session_id,
        total_questions,
        correct_answers,
        score_percent,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/recall/{session_id}/result",
    tag = "Learning",
    responses(
        (status = 200, description = "Get recall result")
    ),
    params(
        ("session_id" = String, Path, description = "Session ID")
    )
)]
pub async fn handler_get_recall_result_by_session_id(
    Extension(state): Extension<LearningApplicationState>,
    Path(session_id): Path<Uuid>,
) -> Result<Json<RecallResultResponse>, AppError> {
    let answers = state.repo.get_recall_answers_by_session(session_id).await?;
    let total_questions = answers.len();
    let correct_answers = answers.iter().filter(|a| a.is_correct).count();
    let score_percent = if total_questions > 0 {
        (correct_answers as f64 / total_questions as f64 * 100.0).round() as i32
    } else {
        0
    };

    Ok(Json(RecallResultResponse {
        session_id,
        total_questions,
        correct_answers,
        score_percent,
    }))
}

fn map_note_to_response(note: crate::domain::learning::entities::Note) -> NoteResponse {
    NoteResponse {
        id: note.id,
        user_id: note.owner_id.unwrap_or_default(),
        topic_id: note.topic_id,
        title: note.title,
        content: note.content.unwrap_or_default(),
        is_official: note.is_official,
    }
}
