use crate::entries::entitiy_enums::notification_logs_types::NotificationLogsTypesEnum;
use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "notification_logs")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub event_id: Uuid,
    pub status: NotificationLogsTypesEnum,
    pub sent_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::notification_event::Entity",
        from = "Column::EventId",
        to = "super::notification_event::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    NotificationEvent,
}

impl Related<super::notification_event::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NotificationEvent.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
