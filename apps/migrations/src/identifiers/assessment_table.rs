pub enum AssessmentQuizzesTableIdentifier {
    Table,
    Id,
    TopicId,
    Title,
}

pub enum AssessmentQuestionsTableIdentifier {
    Table,
    Id,
    QuizId,
    Question,
    CorrectAnswer,
    Options,
}

pub enum AssessmentAttemptsTableIdentifier {
    Table,
    Id,
    UserId,
    QuizId,
    StartedAt,
    SubmittedAt,
    Score,
}

pub enum AssessmentProctoringSignalTableIdentifier {
    Table,
    Id,
    AttemptId,
    SignalType,
    SignalValue,
    CreatedAt,
}
