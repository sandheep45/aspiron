use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum LearningNotesTableIdentifier {
    #[iden = "learning_notes"]
    Table,
    Id,
    OwnerType,
    OwnerId,
    TopicId,
    VideoId,
    VideoTimestamp,
    ContentType,
    Content,
    ExternalUrl,
    ExternalType,
    IsPublic,
    TrustLevel,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
}

#[derive(Iden)]
pub enum LearningProgressTableIdentifier {
    #[iden = "learning_progress"]
    Table,
    Id,
    UserId,
    TopicId,
    ProgressPercent,
    LastAccessedAt,
}

#[derive(Iden)]
pub enum LearningRecallSessionTableIdentifier {
    #[iden = "learning_recall_sessions"]
    Table,
    Id,
    UserId,
    TopicId,
    Status,
    StartedAt,
    CompletedAt,
}

#[derive(Iden)]
pub enum LearningRecallAnswerTableIdentifier {
    #[iden = "learning_recall_answers"]
    Table,
    Id,
    SessionId,
    QuestionType,
    Question,
    Answer,
    IsCorrect,
}
