use std::collections::HashMap;

use uuid::Uuid;

use backend::entries::entity_enums::user_types::UserTypeEnums;

use super::helpers::TestQuiz;
use crate::fixtures::context::{TestChapter, TestRecallSession, TestSubject, TestTopic, TestUser};

pub struct ScenarioContext {
    pub users: HashMap<UserTypeEnums, TestUser>,
    pub subject: Option<TestSubject>,
    pub chapter: Option<TestChapter>,
    pub topic: Option<TestTopic>,
    pub quiz: Option<TestQuiz>,
    pub recall_session: Option<TestRecallSession>,
    pub completed_sessions: Vec<TestRecallSession>,
    pub answer_ids: Vec<Uuid>,
}
