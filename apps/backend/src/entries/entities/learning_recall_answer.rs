use crate::entries::entitiy_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "learning_recall_answers")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub session_id: Uuid,
    pub question_type: LearningRecallQuestionTypeEnum,
    pub question: String,
    pub answer: String,
    pub is_correct: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::learning_recall_session::Entity",
        from = "Column::SessionId",
        to = "super::learning_recall_session::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    LearningRecallSession,
}

impl Related<super::learning_recall_session::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LearningRecallSession.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
