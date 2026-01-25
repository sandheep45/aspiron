use sea_orm::*;
use serde_json::Value;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "assessment_questions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub question: String,
    pub correct_answer: String,
    pub options: Value,
    pub quiz_id: Uuid,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assessment_quiz::Entity",
        from = "Column::QuizId",
        to = "super::assessment_quiz::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    AssessmentQuiz,
}

impl Related<super::assessment_quiz::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentQuiz.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
