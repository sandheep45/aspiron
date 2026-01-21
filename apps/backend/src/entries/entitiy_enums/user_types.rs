use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, Serialize, DeriveActiveEnum, DeriveIden, PartialEq, Eq, EnumIter)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "user_type")]
pub enum UserTypeEnums {
    #[sea_orm(string_value = "STUDENT")]
    STUDENT,
    #[sea_orm(string_value = "TEACHER")]
    TEACHER,
    #[sea_orm(string_value = "ADMIN")]
    ADMIN,
}
