use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::application::assessment::{
    AssessmentApplicationState, create_attempt, get_attempt_results, get_questions, get_quiz,
    get_quizzes, submit_attempt,
};
use crate::http::payloads::assessment::{CreateAttemptRequest, SubmitAttemptRequest};
use crate::http::responses::assessment::{
    AttemptResponse, AttemptResultResponse, QuestionResponse, QuizResponse,
};
use crate::middleware::auth::AuthUser;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/quizzes",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get quizzes by topic ID")
    ),
    params(
        ("topic_id" = String, Path, description = "Topic ID")
    )
)]
pub async fn handler_get_quizzes_by_topic_id(
    Extension(state): Extension<AssessmentApplicationState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<QuizResponse>>, AppError> {
    let quizzes = get_quizzes::execute_get_quizzes(&*state.repo, topic_id).await?;
    Ok(Json(
        quizzes.into_iter().map(map_quiz_to_response).collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/quizzes/{quiz_id}",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get quiz by ID")
    ),
    params(
        ("quiz_id" = String, Path, description = "Quiz ID")
    )
)]
pub async fn handler_fetch_quiz_by_id(
    Extension(state): Extension<AssessmentApplicationState>,
    Path(quiz_id): Path<Uuid>,
) -> Result<Json<QuizResponse>, AppError> {
    let quiz = get_quiz::execute_get_quiz(&*state.repo, quiz_id).await?;
    Ok(Json(map_quiz_to_response(quiz)))
}

#[utoipa::path(
    get,
    path = "/api/v1/quizzes/{quiz_id}/questions",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get questions by quiz ID")
    ),
    params(
        ("quiz_id" = String, Path, description = "Quiz ID")
    )
)]
pub async fn handler_get_questions_by_quiz_id(
    Extension(state): Extension<AssessmentApplicationState>,
    Path(quiz_id): Path<Uuid>,
) -> Result<Json<Vec<QuestionResponse>>, AppError> {
    let questions = get_questions::execute_get_questions(&*state.repo, quiz_id).await?;
    Ok(Json(
        questions
            .into_iter()
            .map(map_question_to_response)
            .collect(),
    ))
}

#[utoipa::path(
    post,
    path = "/api/v1/attempts",
    tag = "Assessment",
    responses(
        (status = 200, description = "Create assessment attempt")
    )
)]
pub async fn handler_create_attempt(
    Extension(state): Extension<AssessmentApplicationState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateAttemptRequest>,
) -> Result<Json<AttemptResponse>, AppError> {
    let attempt =
        create_attempt::execute_create_attempt(&*state.repo, auth_user.0, payload.quiz_id).await?;
    Ok(Json(AttemptResponse {
        id: attempt.id,
        user_id: attempt.user_id,
        quiz_id: attempt.quiz_id,
        status: "in_progress".to_string(),
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/attempts/{attempt_id}/submit",
    tag = "Assessment",
    responses(
        (status = 200, description = "Submit assessment attempt")
    ),
    params(
        ("attempt_id" = String, Path, description = "Attempt ID")
    )
)]
pub async fn handler_submit_attempt(
    Extension(state): Extension<AssessmentApplicationState>,
    Path(attempt_id): Path<Uuid>,
    Json(payload): Json<SubmitAttemptRequest>,
) -> Result<Json<AttemptResponse>, AppError> {
    let answers = payload
        .answers
        .into_iter()
        .map(|a| (a.question_id, a.answer))
        .collect();

    let attempt = submit_attempt::execute_submit_attempt(&*state.repo, attempt_id, answers).await?;
    Ok(Json(AttemptResponse {
        id: attempt.id,
        user_id: attempt.user_id,
        quiz_id: attempt.quiz_id,
        status: "submitted".to_string(),
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/attempts/{attempt_id}/results",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get attempt results")
    ),
    params(
        ("attempt_id" = String, Path, description = "Attempt ID")
    )
)]
pub async fn handler_get_results_by_attempt_id(
    Extension(state): Extension<AssessmentApplicationState>,
    Path(attempt_id): Path<Uuid>,
) -> Result<Json<AttemptResultResponse>, AppError> {
    let attempt =
        get_attempt_results::execute_get_attempt_results(&*state.repo, attempt_id).await?;
    let questions = get_questions::execute_get_questions(&*state.repo, attempt.quiz_id).await?;
    let total_questions = questions.len();
    let score_pct = attempt.score.value();
    let correct_answers = (total_questions as f64 * score_pct as f64 / 100.0).round() as usize;
    Ok(Json(AttemptResultResponse {
        attempt_id: attempt.id,
        total_questions,
        correct_answers,
        score_percent: score_pct,
        passed: score_pct >= 60,
    }))
}

fn map_quiz_to_response(quiz: crate::domain::assessment::entities::Quiz) -> QuizResponse {
    QuizResponse {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        time_limit_minutes: quiz.time_limit_minutes,
        passing_score: quiz.passing_score,
    }
}

fn map_question_to_response(
    question: crate::domain::assessment::entities::Question,
) -> QuestionResponse {
    let options = question
        .options
        .as_array()
        .map(|arr| {
            arr.iter()
                .map(|v| v.as_str().unwrap_or("").to_string())
                .collect()
        })
        .unwrap_or_default();

    QuestionResponse {
        id: question.id,
        quiz_id: question.quiz_id,
        question_text: question.question,
        question_type: "mcq".to_string(),
        options,
    }
}
