use sea_orm_migration::{async_trait::async_trait, prelude::*, sea_orm::DeriveMigrationName};

use crate::identifiers::live_table::{
    LiveSessionLiveRecordingIdentifier, LiveSessionTableIdentifier,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ---------------------------------------------------------------------
        // live_session
        // ---------------------------------------------------------------------
        manager
            .create_table(
                Table::create()
                    .table(LiveSessionTableIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::TopicId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::ScheduledAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::DurationMin)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::Provider)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionTableIdentifier::JoinUrl)
                            .text()
                            .not_null(),
                    )
                    // duration_min > 0
                    .check(Expr::col(LiveSessionTableIdentifier::DurationMin).gt(0))
                    .to_owned(),
            )
            .await?;

        // index for upcoming / past session queries
        manager
            .create_index(
                Index::create()
                    .name("idx_live_session_scheduled_at")
                    .table(LiveSessionTableIdentifier::Table)
                    .col(LiveSessionTableIdentifier::ScheduledAt)
                    .to_owned(),
            )
            .await?;

        // ---------------------------------------------------------------------
        // live_session_live_recording
        // ---------------------------------------------------------------------
        manager
            .create_table(
                Table::create()
                    .table(LiveSessionLiveRecordingIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LiveSessionLiveRecordingIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionLiveRecordingIdentifier::SessionId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionLiveRecordingIdentifier::RecordingUrl)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionLiveRecordingIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_recording_session")
                            .from(
                                LiveSessionLiveRecordingIdentifier::Table,
                                LiveSessionLiveRecordingIdentifier::SessionId,
                            )
                            .to(
                                LiveSessionTableIdentifier::Table,
                                LiveSessionTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // index FK (important for performance)
        manager
            .create_index(
                Index::create()
                    .name("idx_recording_session_id")
                    .table(LiveSessionLiveRecordingIdentifier::Table)
                    .col(LiveSessionLiveRecordingIdentifier::SessionId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first
        manager
            .drop_index(
                Index::drop()
                    .name("idx_recording_session_id")
                    .table(LiveSessionLiveRecordingIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_live_session_scheduled_at")
                    .table(LiveSessionTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        // Drop tables (child first)
        manager
            .drop_table(
                Table::drop()
                    .table(LiveSessionLiveRecordingIdentifier::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(LiveSessionTableIdentifier::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
