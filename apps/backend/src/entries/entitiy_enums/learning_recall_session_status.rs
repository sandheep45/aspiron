use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveActiveEnum, EnumIter, DeriveIden, Serialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "learning_recall_session_status"
)]
pub enum LearningRecallSessionStatusEnum {
    #[sea_orm(string_value = "pending")]
    PENDING,
    #[sea_orm(string_value = "completed")]
    COMPLETED,
}
