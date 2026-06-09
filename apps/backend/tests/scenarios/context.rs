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

impl ScenarioContext {
    pub fn user(&self, role: &UserTypeEnums) -> &TestUser {
        self.users
            .get(role)
            .unwrap_or_else(|| panic!("{:?} user not found", role))
    }

    pub fn topic_id(&self) -> Uuid {
        self.topic.as_ref().expect("topic not found").id
    }

    pub fn quiz_id(&self) -> Uuid {
        self.quiz.as_ref().expect("quiz not found").id
    }
}
