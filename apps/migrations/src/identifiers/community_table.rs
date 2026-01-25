use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum CommunityThreadTableIdentifier {
    #[iden = "community_threads"]
    Table,
    Id,
    UserId,
    TopicId,
    Title,
    CreatedAt,
}

#[derive(Iden)]
pub enum CommunityPostsTableIdentifier {
    #[iden = "community_posts"]
    Table,
    Id,
    ThreadId,
    UserId,
    Content,
    CreatedAt,
}

#[derive(Iden)]
pub enum CommunityBotEventsTableIdentifier {
    #[iden = "community_bot_events"]
    Table,
    Id,
    ThreadId,
    EventType,
    Payload,
    CreatedAt,
}
