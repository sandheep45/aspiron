use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::PermissionTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PermissionTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::Name)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::ResourceType)
                            .custom("resource_type")
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::Action)
                            .custom("action_type")
                            .not_null(),
                    )
                    .col(ColumnDef::new(PermissionTableIdentifiers::Description).text())
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(PermissionTableIdentifiers::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create unique index for resource_type + action
        manager
            .create_index(
                Index::create()
                    .name("idx_permissions_resource_action")
                    .table(PermissionTableIdentifiers::Table)
                    .col(PermissionTableIdentifiers::ResourceType)
                    .col(PermissionTableIdentifiers::Action)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop index first
        manager
            .drop_index(
                Index::drop()
                    .name("idx_permissions_resource_action")
                    .to_owned(),
            )
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(PermissionTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
