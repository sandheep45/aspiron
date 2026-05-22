use sea_orm::DatabaseConnection;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::context::ScenarioContext;
use crate::fixtures::helpers;

pub struct ScenarioBuilder<'db> {
    db: &'db DatabaseConnection,
    users: Vec<(String, String, UserTypeEnums)>,
    subject: Option<(String, ExamTypeEnums)>,
    chapter: Option<String>,
    topic: Option<String>,
    quiz: Option<String>,
    question_count: usize,
    has_recall_session: bool,
}

impl<'db> ScenarioBuilder<'db> {
    pub fn new(db: &'db DatabaseConnection) -> Self {
        Self {
            db,
            users: Vec::new(),
            subject: None,
            chapter: None,
            topic: None,
            quiz: None,
            question_count: 0,
            has_recall_session: false,
        }
    }

    pub fn with_user(mut self, email: &str, password: &str, role: UserTypeEnums) -> Self {
        self.users
            .push((email.to_string(), password.to_string(), role));
        self
    }

    pub fn subject(mut self, name: &str, exam_type: ExamTypeEnums) -> Self {
        self.subject = Some((name.to_string(), exam_type));
        self
    }

    pub fn chapter(mut self, name: &str) -> Self {
        self.chapter = Some(name.to_string());
        self
    }

    pub fn topic(mut self, name: &str) -> Self {
        self.topic = Some(name.to_string());
        self
    }

    pub fn quiz(mut self, title: &str) -> Self {
        self.quiz = Some(title.to_string());
        self
    }

    pub fn questions(mut self, count: usize) -> Self {
        self.question_count = count;
        self
    }

    pub fn recall_session(mut self) -> Self {
        self.has_recall_session = true;
        self
    }

    pub async fn build(self) -> ScenarioContext {
        let mut ctx = ScenarioContext {
            users: std::collections::HashMap::new(),
            subject: None,
            chapter: None,
            topic: None,
            quiz: None,
            recall_session: None,
        };

        for (email, password, role) in &self.users {
            let test_user = helpers::create_test_user(self.db, email, password, *role).await;
            ctx.users.insert(*role, test_user);
        }

        if let Some((name, exam_type)) = &self.subject {
            let test_subject = helpers::create_test_subject(self.db, name, exam_type.clone()).await;

            if let Some(chapter_name) = &self.chapter {
                let test_chapter =
                    helpers::create_test_chapter(self.db, test_subject.id, chapter_name, 1).await;

                if let Some(topic_name) = &self.topic {
                    let test_topic =
                        helpers::create_test_topic(self.db, test_chapter.id, topic_name, 1).await;

                    if let Some(quiz_title) = &self.quiz {
                        let test_quiz =
                            helpers::create_test_quiz(self.db, test_topic.id, quiz_title).await;

                        if self.question_count > 0 {
                            helpers::create_test_questions(
                                self.db,
                                test_quiz.id,
                                self.question_count,
                            )
                            .await;
                        }

                        ctx.quiz = Some(test_quiz);
                    }

                    if self.has_recall_session
                        && let Some(student) = ctx.users.get(&UserTypeEnums::STUDENT)
                    {
                        let session =
                            helpers::create_test_recall_session(self.db, student.id, test_topic.id)
                                .await;
                        ctx.recall_session = Some(session);
                    }

                    ctx.topic = Some(test_topic);
                }

                ctx.chapter = Some(test_chapter);
            }

            ctx.subject = Some(test_subject);
        }

        ctx
    }
}
