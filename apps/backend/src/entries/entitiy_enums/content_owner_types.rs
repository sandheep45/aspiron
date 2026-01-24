use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveIden, DeriveActiveEnum, EnumIter, Serialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "content_owner_type")]
pub enum ContentOwnerTypeEnum {
    #[sea_orm(string_value = "TEACHER")]
    TEACHER,
    #[sea_orm(string_value = "STUDENT")]
    STUDENT,
    #[sea_orm(string_value = "AI")]
    AI,
    #[sea_orm(string_value = "COMMUNITY")]
    COMMUNITY,
}
