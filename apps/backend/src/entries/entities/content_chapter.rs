use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "content_chapters")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub order_number: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::content_subject::Entity",
        from = "Column::SubjectId",
        to = "super::content_subject::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ContentSubject,
    #[sea_orm(has_many = "super::content_topic::Entity")]
    ContentTopic,
}

impl Related<super::content_subject::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentSubject.def()
    }
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
