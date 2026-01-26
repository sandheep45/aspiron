use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::RoleTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(RoleTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::Name)
                            .custom("user_type")
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::DisplayName)
                            .string()
                            .not_null(),
                    )
                    .col(ColumnDef::new(RoleTableIdentifiers::Description).text())
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::IsSystemRole)
                            .boolean()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(RoleTableIdentifiers::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(RoleTableIdentifiers::Table).to_owned())
            .await
    }
}
