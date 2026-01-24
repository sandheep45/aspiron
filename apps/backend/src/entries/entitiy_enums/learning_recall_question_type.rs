use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveActiveEnum, EnumIter, DeriveIden, Serialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "learning_recall_question_type"
)]
pub enum LearningRecallQuestionTypeEnum {
    #[sea_orm(string_value = "mcq")]
    MCQ,
    #[sea_orm(string_value = "reflection")]
    REFLECTION,
}
