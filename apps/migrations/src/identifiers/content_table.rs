use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum ContentSubjectTableIdentifier {
    Table,
    Id,
    Name,
    ExamType,
    CreateAt,
}

#[derive(Iden)]
pub enum ContentChapterTableIdentifier {
    Table,
    Id,
    SubjectId,
    Name,
    OrderNumber,
}

#[derive(Iden)]
pub enum ContentTopicTableIdentifier {
    Table,
    Id,
    ChapterId,
    Name,
    OrderNumber,
}

#[derive(Iden)]
pub enum ContentVideoTableIdentifier {
    Table,
    Id,
    TopicId,
    Title,
    DurationSeconds,
    VideoUrl,
    Transcript,
}
