use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum NotificationEventsTableIdentifier {
    #[iden = "notification_events"]
    Table,
    Id,
    UserId,
    Type,
    Payload,
    ScheduledAt,
}

#[derive(Iden)]
pub enum NotificationLogsTableIdentifier {
    #[iden = "notification_logs"]
    Table,
    Id,
    EventId,
    Status,
    SentAt,
}
