use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::AuditLogTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AuditLogTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::UserId).uuid(), // Nullable - some system actions may not have a user
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::Action)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::ResourceType).string(), // Nullable - some actions may not be resource-specific
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::ResourceId).uuid(), // Nullable - some actions may not be resource-specific
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::OldValues).json_binary(), // Nullable - for updates/deletes
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::NewValues).json_binary(), // Nullable - for creates/updates
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::IpAddress).string(), // Nullable - some actions may be system-generated
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::UserAgent).text(), // Nullable - some actions may be system-generated
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::Timestamp)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::Success)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::FailureReason).text(), // Nullable - only for failed actions
                    )
                    .col(
                        ColumnDef::new(AuditLogTableIdentifiers::SessionId).string(), // Nullable - for session tracking
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_audit_logs_user_id")
                            .from(
                                AuditLogTableIdentifiers::Table,
                                AuditLogTableIdentifiers::UserId,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create indexes for audit log queries
        manager
            .create_index(
                Index::create()
                    .name("idx_audit_logs_user_id")
                    .table(AuditLogTableIdentifiers::Table)
                    .col(AuditLogTableIdentifiers::UserId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_audit_logs_timestamp")
                    .table(AuditLogTableIdentifiers::Table)
                    .col(AuditLogTableIdentifiers::Timestamp)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_audit_logs_resource")
                    .table(AuditLogTableIdentifiers::Table)
                    .col(AuditLogTableIdentifiers::ResourceType)
                    .col(AuditLogTableIdentifiers::ResourceId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_audit_logs_action")
                    .table(AuditLogTableIdentifiers::Table)
                    .col(AuditLogTableIdentifiers::Action)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_audit_logs_session_id")
                    .table(AuditLogTableIdentifiers::Table)
                    .col(AuditLogTableIdentifiers::SessionId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first
        manager
            .drop_index(Index::drop().name("idx_audit_logs_user_id").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_audit_logs_timestamp").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_audit_logs_resource").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_audit_logs_action").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_audit_logs_session_id").to_owned())
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(AuditLogTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
