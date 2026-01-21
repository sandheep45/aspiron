pub enum LearningNotesTableIdentifier {
    Table,
    Id,
    OwnerType,
    OwnerId,
    TopicId,
    VideoId,
    VideoTimestamp,
    ContentType,
    Content,
    EnternalUrl,
    ExternalType,
    IsPublic,
    TrustLevel,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
}

pub enum LearningProgressTableIdentifier {
    Table,
    Id,
    UserId,
    TopicId,
    ProgressPercent,
    LastAccessedAt,
}

pub enum LearningRecallSessionTableIdentifier {
    Table,
    Id,
    UserId,
    TopicId,
    Status,
    StartedAt,
    CompletedAt,
}

pub enum LearningRecallAnswerTableIdentifier {
    Table,
    Id,
    SessionId,
    QuestionType,
    Question,
    Answer,
    IsCorrect,
}
