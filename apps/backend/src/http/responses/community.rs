use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CommunityThreadResponse")]
pub struct ThreadResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    pub title: String,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CommunityPostResponse")]
pub struct PostResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub thread_id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    pub content: String,
}
