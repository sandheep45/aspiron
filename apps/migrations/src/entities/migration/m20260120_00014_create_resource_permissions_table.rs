use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::ResourcePermissionTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::ResourceType)
                            .custom("resource_type")
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::ResourceId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::Permission)
                            .custom("action_type")
                            .not_null(),
                    )
                    .col(ColumnDef::new(ResourcePermissionTableIdentifiers::GrantedBy).uuid())
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::GrantedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::ExpiresAt)
                            .timestamp_with_time_zone(),
                    )
                    .col(
                        ColumnDef::new(ResourcePermissionTableIdentifiers::Conditions)
                            .json_binary(), // Conditional permissions (time-based, IP-based, etc.)
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_resource_permissions_user_id")
                            .from(
                                ResourcePermissionTableIdentifiers::Table,
                                ResourcePermissionTableIdentifiers::UserId,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_resource_permissions_granted_by")
                            .from(
                                ResourcePermissionTableIdentifiers::Table,
                                ResourcePermissionTableIdentifiers::GrantedBy,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create indexes for resource permission queries
        manager
            .create_index(
                Index::create()
                    .name("ux_resource_permissions_resource_user_permission")
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(ResourcePermissionTableIdentifiers::ResourceType)
                    .col(ResourcePermissionTableIdentifiers::ResourceId)
                    .col(ResourcePermissionTableIdentifiers::UserId)
                    .col(ResourcePermissionTableIdentifiers::Permission)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_resource_permissions_user_id")
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(ResourcePermissionTableIdentifiers::UserId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_resource_permissions_resource")
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(ResourcePermissionTableIdentifiers::ResourceType)
                    .col(ResourcePermissionTableIdentifiers::ResourceId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_resource_permissions_granted_by")
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(ResourcePermissionTableIdentifiers::GrantedBy)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_resource_permissions_expires_at")
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .col(ResourcePermissionTableIdentifiers::ExpiresAt)
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
                    .name("ux_resource_permissions_resource_user_permission")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_resource_permissions_user_id")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_resource_permissions_resource")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_resource_permissions_granted_by")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_resource_permissions_expires_at")
                    .to_owned(),
            )
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(ResourcePermissionTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
