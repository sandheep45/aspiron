pub enum ContentSubjectTableIdentifier {
    Table,
    Id,
    Name,
    ExamType,
    CreateAt,
}

pub enum ContentChapterTableIdentifier {
    Table,
    Id,
    SubjectId,
    Name,
    OrderNumber,
}

pub enum ContentTopicTableIdentifier {
    Table,
    Id,
    ChapterId,
    Name,
    OrderNumber,
}

pub enum ContentVideoTableIdentifier {
    Table,
    Id,
    TopicId,
    Title,
    DurationSeconds,
    VideoUrl,
    Transcript,
}
