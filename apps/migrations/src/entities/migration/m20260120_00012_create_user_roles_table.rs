use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::UserRoleTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(UserRoleTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::Id)
                            .primary_key()
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::RoleId)
                            .uuid()
                            .not_null(),
                    )
                    .col(ColumnDef::new(UserRoleTableIdentifiers::AssignedBy).uuid())
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::AssignedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::ExpiresAt)
                            .timestamp_with_time_zone(),
                    )
                    .col(
                        ColumnDef::new(UserRoleTableIdentifiers::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_roles_user_id")
                            .from(
                                UserRoleTableIdentifiers::Table,
                                UserRoleTableIdentifiers::UserId,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_roles_role_id")
                            .from(
                                UserRoleTableIdentifiers::Table,
                                UserRoleTableIdentifiers::RoleId,
                            )
                            .to("roles", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_roles_assigned_by")
                            .from(
                                UserRoleTableIdentifiers::Table,
                                UserRoleTableIdentifiers::AssignedBy,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create unique index for user_id + role_id
        manager
            .create_index(
                Index::create()
                    .name("ux_user_roles_user_role")
                    .table(UserRoleTableIdentifiers::Table)
                    .col(UserRoleTableIdentifiers::UserId)
                    .col(UserRoleTableIdentifiers::RoleId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index for assigned_by for audit queries
        manager
            .create_index(
                Index::create()
                    .name("idx_user_roles_assigned_by")
                    .table(UserRoleTableIdentifiers::Table)
                    .col(UserRoleTableIdentifiers::AssignedBy)
                    .to_owned(),
            )
            .await?;

        // Create index for expires_at for cleanup queries
        manager
            .create_index(
                Index::create()
                    .name("idx_user_roles_expires_at")
                    .table(UserRoleTableIdentifiers::Table)
                    .col(UserRoleTableIdentifiers::ExpiresAt)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first
        manager
            .drop_index(Index::drop().name("ux_user_roles_user_role").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_user_roles_assigned_by").to_owned())
            .await?;

        manager
            .drop_index(Index::drop().name("idx_user_roles_expires_at").to_owned())
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(UserRoleTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
