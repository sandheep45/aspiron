use sea_orm_migration::prelude::*;

use crate::identifiers::rbac_table::UserProfileTableIdentifiers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(UserProfileTableIdentifiers::Table)
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::UserId)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(UserProfileTableIdentifiers::FirstName).string())
                    .col(ColumnDef::new(UserProfileTableIdentifiers::LastName).string())
                    .col(ColumnDef::new(UserProfileTableIdentifiers::AvatarUrl).string())
                    .col(ColumnDef::new(UserProfileTableIdentifiers::Phone).string())
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::Timezone)
                            .string()
                            .default("UTC"),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::Language)
                            .string()
                            .default("en"),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::Preferences).json_binary(), // User settings, notifications, etc.
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::LastLogin)
                            .timestamp_with_time_zone(),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::LoginCount)
                            .integer()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::AccountLockedUntil)
                            .timestamp_with_time_zone(),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::FailedLoginAttempts)
                            .integer()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::MfaEnabled)
                            .boolean()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(UserProfileTableIdentifiers::MfaSecretEncrypted).string(), // Encrypted MFA secret storage
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_profiles_user_id")
                            .from(
                                UserProfileTableIdentifiers::Table,
                                UserProfileTableIdentifiers::UserId,
                            )
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Create indexes for user profile queries
        manager
            .create_index(
                Index::create()
                    .name("idx_user_profiles_last_login")
                    .table(UserProfileTableIdentifiers::Table)
                    .col(UserProfileTableIdentifiers::LastLogin)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_user_profiles_account_locked_until")
                    .table(UserProfileTableIdentifiers::Table)
                    .col(UserProfileTableIdentifiers::AccountLockedUntil)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_user_profiles_mfa_enabled")
                    .table(UserProfileTableIdentifiers::Table)
                    .col(UserProfileTableIdentifiers::MfaEnabled)
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
                    .name("idx_user_profiles_last_login")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_user_profiles_account_locked_until")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_user_profiles_mfa_enabled")
                    .to_owned(),
            )
            .await?;

        // Then drop table
        manager
            .drop_table(
                Table::drop()
                    .table(UserProfileTableIdentifiers::Table)
                    .to_owned(),
            )
            .await
    }
}
