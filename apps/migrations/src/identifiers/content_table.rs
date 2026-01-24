use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum ContentSubjectTableIdentifier {
    #[iden = "content_subjects"]
    Table,
    Id,
    Name,
    ExamType,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
pub enum ContentChapterTableIdentifier {
    #[iden = "content_chapters"]
    Table,
    Id,
    SubjectId,
    Name,
    OrderNumber,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
pub enum ContentTopicTableIdentifier {
    #[iden = "content_topics"]
    Table,
    Id,
    ChapterId,
    Name,
    OrderNumber,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
pub enum ContentVideoTableIdentifier {
    #[iden = "content_videos"]
    Table,
    Id,
    TopicId,
    Title,
    DurationSeconds,
    VideoUrl,
    Transcript,
    CreatedAt,
    UpdatedAt,
}
