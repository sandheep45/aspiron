use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveActiveEnum, EnumIter, DeriveIden, Serialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "notification_logs_types"
)]
pub enum NotificationLogsTypesEnum {
    #[sea_orm(string_value = "sent")]
    SENT,
    #[sea_orm(string_value = "skipped")]
    SKIPPED,
    #[sea_orm(string_value = "failed")]
    FAILED,
}
