use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum AssessmentQuizzesTableIdentifier {
    #[iden = "assessment_quizzes"]
    Table,
    Id,
    TopicId,
    Title,
}

#[derive(Iden)]
pub enum AssessmentQuestionsTableIdentifier {
    #[iden = "assessment_questions"]
    Table,
    Id,
    QuizId,
    Question,
    CorrectAnswer,
    Options,
}

#[derive(Iden)]
pub enum AssessmentAttemptsTableIdentifier {
    #[iden = "assessment_attempts"]
    Table,
    Id,
    UserId,
    QuizId,
    StartedAt,
    SubmittedAt,
    Score,
}

#[derive(Iden)]
pub enum AssessmentProctoringSignalTableIdentifier {
    #[iden = "assessment_proctoring"]
    Table,
    Id,
    AttemptId,
    SignalType,
    SignalValue,
    CreatedAt,
}
