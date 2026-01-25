use crate::entries::entitiy_enums::{
    content_owner_types::ContentOwnerTypeEnum, notes_content_type::NotesContentTypeEnum,
    trust_level::TrustLevelEnum,
};
use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "learning_notes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub topic_id: Uuid,
    pub owner_type: ContentOwnerTypeEnum,
    pub owner_id: Option<Uuid>,
    pub video_id: Option<Uuid>,
    pub video_timestamp: Option<i32>,
    pub content_type: NotesContentTypeEnum,
    pub content: Option<String>,
    pub external_url: Option<String>,
    pub external_type: Option<String>,
    pub is_public: bool,
    pub trust_level: TrustLevelEnum,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    pub deleted_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::content_topic::Entity",
        from = "Column::TopicId",
        to = "super::content_topic::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ContentTopic,
    #[sea_orm(
        belongs_to = "super::content_video::Entity",
        from = "Column::VideoId",
        to = "super::content_video::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ContentVideo,
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl Related<super::content_video::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentVideo.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
