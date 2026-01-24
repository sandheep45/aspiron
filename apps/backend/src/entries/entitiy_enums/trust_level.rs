use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, DeriveActiveEnum, EnumIter, DeriveIden)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "trust_level")]
pub enum TrustLevelEnum {
    #[sea_orm(string_value = "official")]
    OFFICIAL,
    #[sea_orm(string_value = "ai")]
    AI,
    #[sea_orm(string_value = "community")]
    COMMUNITY,
    #[sea_orm(string_value = "user")]
    USER,
}
