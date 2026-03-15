use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "CommunityThreadResponse")]
pub struct CommunityThreadResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub topic_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "CommunityPostResponse")]
pub struct CommunityPostResponse {
    pub id: Uuid,
    pub thread_id: Uuid,
    pub user_id: Uuid,
    pub content: String,
}
