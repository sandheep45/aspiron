use crate::entries::entitiy_enums::exam_types::ExamTypeEnums;
use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "content_subjects")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub name: String,
    pub exam_type: ExamTypeEnums,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::content_chapter::Entity")]
    ContentChapter,
}

impl Related<super::content_chapter::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentChapter.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
