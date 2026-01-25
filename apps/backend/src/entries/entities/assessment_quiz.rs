use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "assessment_quizzes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
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
    #[sea_orm(has_many = "super::assessment_question::Entity")]
    AssessmentQuestion,
    #[sea_orm(has_many = "super::assessment_attempt::Entity")]
    AssessmentAttempt,
}

impl Related<super::content_topic::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentTopic.def()
    }
}

impl Related<super::assessment_question::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentQuestion.def()
    }
}

impl Related<super::assessment_attempt::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentAttempt.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
