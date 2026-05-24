use serde::Deserialize;
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateAttemptRequest")]
pub struct CreateAttemptRequest {
    #[schema(value_type = String)]
    pub quiz_id: Uuid,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubmitAnswerPayload")]
pub struct SubmitAnswerPayload {
    #[schema(value_type = String)]
    pub question_id: Uuid,
    pub answer: String,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubmitAttemptRequest")]
pub struct SubmitAttemptRequest {
    pub answers: Vec<SubmitAnswerPayload>,
}
