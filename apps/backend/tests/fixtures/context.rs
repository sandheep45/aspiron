use uuid::Uuid;

pub struct TestUser {
    pub id: Uuid,
    pub email: String,
}

pub struct TestSubject {
    pub id: Uuid,
}

pub struct TestChapter {
    pub id: Uuid,
}

pub struct TestTopic {
    pub id: Uuid,
}

pub struct TestRecallSession {
    pub id: Uuid,
}

pub struct TestNote {
    pub id: Uuid,
}
