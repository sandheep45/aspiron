use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum LiveSessionTableIdentifier {
    #[iden = "live_sessions"]
    Table,
    Id,
    TopicId,
    ScheduledAt,
    DurationMin,
    Provider,
    JoinUrl,
}

#[derive(Iden)]
pub enum LiveSessionLiveRecordingIdentifier {
    #[iden = "live_session_recordings"]
    Table,
    Id,
    SessionId,
    RecordingUrl,
    CreatedAt,
}
