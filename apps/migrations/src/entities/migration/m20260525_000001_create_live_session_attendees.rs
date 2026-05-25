use sea_orm_migration::{async_trait::async_trait, prelude::*, sea_orm::DeriveMigrationName};

use crate::identifiers::live_table::{LiveSessionAttendeeIdentifier, LiveSessionTableIdentifier};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LiveSessionAttendeeIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionAttendeeIdentifier::SessionId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionAttendeeIdentifier::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LiveSessionAttendeeIdentifier::JoinedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(LiveSessionAttendeeIdentifier::LeftAt)
                            .timestamp_with_time_zone(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_attendee_session")
                            .from(
                                LiveSessionAttendeeIdentifier::Table,
                                LiveSessionAttendeeIdentifier::SessionId,
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

        manager
            .create_index(
                Index::create()
                    .name("idx_attendee_session_id")
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .col(LiveSessionAttendeeIdentifier::SessionId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_attendee_user_id")
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .col(LiveSessionAttendeeIdentifier::UserId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name("idx_attendee_session_id")
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_attendee_user_id")
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(LiveSessionAttendeeIdentifier::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
