use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "live_sessions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub topic_id: Uuid,
    pub scheduled_at: DateTimeWithTimeZone,
    pub duration_min: i32,
    pub provider: String,
    pub join_url: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::content_topic::Entity",
        from = "Column::TopicId",
        to = "super::content_topic::Column::Id"
    )]
    ContentTopic,
    #[sea_orm(has_many = "super::live_session_recording::Entity")]
    LiveSessionRecording,
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl Related<super::live_session_recording::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LiveSessionRecording.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
