use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "content_videos")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub topic_id: Uuid,
    pub transcript: Option<String>,
    pub title: String,
    pub duration_seconds: i32,
    pub video_url: String,
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
    #[sea_orm(has_many = "super::learning_notes::Entity")]
    LearningNotes,
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl Related<super::learning_notes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LearningNotes.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
