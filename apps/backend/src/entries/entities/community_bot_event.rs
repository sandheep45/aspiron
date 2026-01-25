use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use serde_json::Value;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "community_bot_events")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub thread_id: Uuid,
    pub event_type: String,
    pub payload: Value,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::community_thread::Entity",
        from = "Column::ThreadId",
        to = "super::community_thread::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    CommunityThread,
}

impl Related<super::community_thread::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CommunityThread.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
