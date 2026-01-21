pub enum CommunityThreadTableIdentifier {
    Table,
    Id,
    UserId,
    TopicId,
    Title,
    CreatedAt,
}

pub enum CommunityPostsTableIdentifier {
    Table,
    Id,
    ThreadId,
    UserId,
    Content,
    CreatedAt,
}

pub enum CommunityBotEventsTableIdentifier {
    Table,
    Id,
    ThreadId,
    EventType,
    Payload,
    CreatedAt,
}
