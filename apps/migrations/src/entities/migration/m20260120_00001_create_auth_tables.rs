use sea_orm_migration::prelude::*;

use crate::identifiers::auth_table::AuthTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AuthTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::Email)
                            .string()
                            .unique_key()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::PasswordHash)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::IsActive)
                            .boolean()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AuthTableIdentifiers::Role)
                            .custom("user_type")
                            .not_null(),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AuthTableIdentifiers::Table).to_owned())
            .await
    }
}
