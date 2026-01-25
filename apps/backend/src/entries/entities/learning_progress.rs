use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "learning_progress")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub topic_id: Uuid,
    pub user_id: Uuid,
    pub progress_percent: i32,
    pub last_accessed_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
    #[sea_orm(
        belongs_to = "super::content_topic::Entity",
        from = "Column::TopicId",
        to = "super::content_topic::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ContentTopic,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
