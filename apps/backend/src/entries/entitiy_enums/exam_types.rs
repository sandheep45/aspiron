use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Serialize, Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, DeriveIden, Hash)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "exam_type")]
pub enum ExamTypeEnums {
    #[sea_orm(string_value = "JEE")]
    JEE,
    #[sea_orm(string_value = "NEET")]
    NEET,
    #[sea_orm(string_value = "STATE_PGT")]
    StatePGT,
}
