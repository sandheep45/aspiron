use std::collections::HashMap;

use uuid::Uuid;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

pub struct TestUser {
    pub id: Uuid,
    pub email: String,
    pub password: String,
    pub role: UserTypeEnums,
}

pub struct TestSubject {
    pub id: Uuid,
    pub name: String,
    pub exam_type: ExamTypeEnums,
}

pub struct TestChapter {
    pub id: Uuid,
    pub name: String,
}

pub struct TestTopic {
    pub id: Uuid,
    pub name: String,
}

pub struct TestQuiz {
    pub id: Uuid,
    pub title: String,
}

pub struct TestRecallSession {
    pub id: Uuid,
}

pub struct ScenarioContext {
    pub users: HashMap<UserTypeEnums, TestUser>,
    pub subject: Option<TestSubject>,
    pub chapter: Option<TestChapter>,
    pub topic: Option<TestTopic>,
    pub quiz: Option<TestQuiz>,
    pub recall_session: Option<TestRecallSession>,
}
