use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::UserSessionTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(UserSessionTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::SessionTokenHash)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::IpAddress).string(), // Nullable - some sessions may be system-generated
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::UserAgent).text(), // Nullable - some sessions may be system-generated
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::LastActivity)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::ExpiresAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(UserSessionTableIdentifiers::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_sessions_user_id")
                            .from(
                                UserSessionTableIdentifiers::Table,
                                UserSessionTableIdentifiers::UserId,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create indexes for session queries
        manager
            .create_index(
                Index::create()
                    .name("idx_user_sessions_user_id")
                    .table(UserSessionTableIdentifiers::Table)
                    .col(UserSessionTableIdentifiers::UserId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_user_sessions_expires_at")
                    .table(UserSessionTableIdentifiers::Table)
                    .col(UserSessionTableIdentifiers::ExpiresAt)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_user_sessions_last_activity")
                    .table(UserSessionTableIdentifiers::Table)
                    .col(UserSessionTableIdentifiers::LastActivity)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_user_sessions_is_active")
                    .table(UserSessionTableIdentifiers::Table)
                    .col(UserSessionTableIdentifiers::IsActive)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first
        manager
            .drop_index(Index::drop().name("idx_user_sessions_user_id").to_owned())
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_user_sessions_expires_at")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_user_sessions_last_activity")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(Index::drop().name("idx_user_sessions_is_active").to_owned())
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(UserSessionTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
