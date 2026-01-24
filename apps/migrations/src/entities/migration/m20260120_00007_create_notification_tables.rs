use sea_orm_migration::{
    DbErr, MigrationTrait, SchemaManager, async_trait,
    prelude::{ColumnDef, Table},
    sea_orm::DeriveMigrationName,
};

use crate::identifiers::notification_table::{
    NotificationEventsTableIdentifier, NotificationLogsTableIdentifier,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(NotificationEventsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(NotificationEventsTableIdentifier::Id)
                            .not_null()
                            .primary_key()
                            .uuid(),
                    )
                    .col(
                        ColumnDef::new(NotificationEventsTableIdentifier::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(NotificationEventsTableIdentifier::Payload)
                            .json_binary()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(NotificationEventsTableIdentifier::Type)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(NotificationEventsTableIdentifier::ScheduledAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(NotificationLogsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(NotificationLogsTableIdentifier::Id)
                            .not_null()
                            .primary_key()
                            .uuid(),
                    )
                    .col(
                        ColumnDef::new(NotificationLogsTableIdentifier::EventId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(NotificationLogsTableIdentifier::Status)
                            .custom("notification_logs_types")
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(NotificationLogsTableIdentifier::SentAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(NotificationEventsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(NotificationLogsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
