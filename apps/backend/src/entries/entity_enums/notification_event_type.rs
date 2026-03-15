use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveActiveEnum, EnumIter, DeriveIden, Serialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "notification_event_type"
)]
pub enum NotificationEventTypeEnum {
    #[sea_orm(string_value = "recall")]
    RECALL,
    #[sea_orm(string_value = "progress")]
    PROGRESS,
    #[sea_orm(string_value = "system")]
    SYSTEM,
}
