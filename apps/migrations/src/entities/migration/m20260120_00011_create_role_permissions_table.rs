use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::RolePermissionTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(RolePermissionTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(RolePermissionTableIdentifiers::Id)
                            .uuid()
                            .primary_key()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(RolePermissionTableIdentifiers::RoleId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(RolePermissionTableIdentifiers::PermissionId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(RolePermissionTableIdentifiers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_role_permissions_role_id")
                            .from(
                                RolePermissionTableIdentifiers::Table,
                                RolePermissionTableIdentifiers::RoleId,
                            )
                            .to("roles", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_role_permissions_permission_id")
                            .from(
                                RolePermissionTableIdentifiers::Table,
                                RolePermissionTableIdentifiers::PermissionId,
                            )
                            .to("permissions", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create unique index for role_id + permission_id
        manager
            .create_index(
                Index::create()
                    .name("ux_role_permissions_role_permission")
                    .table(RolePermissionTableIdentifiers::Table)
                    .col(RolePermissionTableIdentifiers::RoleId)
                    .col(RolePermissionTableIdentifiers::PermissionId)
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
                    .name("ux_role_permissions_role_permission")
                    .to_owned(),
            )
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(RolePermissionTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
