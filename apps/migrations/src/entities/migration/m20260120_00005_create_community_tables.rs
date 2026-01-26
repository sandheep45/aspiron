use sea_orm_migration::{
    DbErr, MigrationTrait, SchemaManager, async_trait,
    prelude::{ColumnDef, ForeignKey, ForeignKeyAction, Index, Table},
    sea_orm::DeriveMigrationName,
};

use crate::identifiers::{
    community_table::{
        CommunityBotEventsTableIdentifier, CommunityPostsTableIdentifier,
        CommunityThreadTableIdentifier,
    },
    user_table::UserTableIdentifiers,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ------------------ THREADS ------------------
        manager
            .create_table(
                Table::create()
                    .table(CommunityThreadTableIdentifier::Table)
                    .col(
                        ColumnDef::new(CommunityThreadTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(CommunityThreadTableIdentifier::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityThreadTableIdentifier::TopicId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityThreadTableIdentifier::Title)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityThreadTableIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_community_threads_user")
                            .from(
                                CommunityThreadTableIdentifier::Table,
                                CommunityThreadTableIdentifier::UserId,
                            )
                            .to(UserTableIdentifiers::Table, UserTableIdentifiers::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ POSTS ------------------
        manager
            .create_table(
                Table::create()
                    .table(CommunityPostsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(CommunityPostsTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(CommunityPostsTableIdentifier::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityPostsTableIdentifier::ThreadId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityPostsTableIdentifier::Content)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityPostsTableIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_community_posts_user")
                            .from(
                                CommunityPostsTableIdentifier::Table,
                                CommunityPostsTableIdentifier::UserId,
                            )
                            .to(UserTableIdentifiers::Table, UserTableIdentifiers::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_community_posts_thread")
                            .from(
                                CommunityPostsTableIdentifier::Table,
                                CommunityPostsTableIdentifier::ThreadId,
                            )
                            .to(
                                CommunityThreadTableIdentifier::Table,
                                CommunityThreadTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ BOT EVENTS ------------------
        manager
            .create_table(
                Table::create()
                    .table(CommunityBotEventsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(CommunityBotEventsTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(CommunityBotEventsTableIdentifier::ThreadId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityBotEventsTableIdentifier::EventType)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityBotEventsTableIdentifier::Payload)
                            .json_binary()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CommunityBotEventsTableIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_community_bot_events_thread")
                            .from(
                                CommunityBotEventsTableIdentifier::Table,
                                CommunityBotEventsTableIdentifier::ThreadId,
                            )
                            .to(
                                CommunityThreadTableIdentifier::Table,
                                CommunityThreadTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ INDEXES ------------------
        manager
            .create_index(
                Index::create()
                    .name("idx_community_posts_thread")
                    .table(CommunityPostsTableIdentifier::Table)
                    .col(CommunityPostsTableIdentifier::ThreadId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes
        manager
            .drop_index(Index::drop().name("idx_community_posts_thread").to_owned())
            .await?;

        // Drop tables (child → parent)
        manager
            .drop_table(
                Table::drop()
                    .table(CommunityBotEventsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(CommunityPostsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(CommunityThreadTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
