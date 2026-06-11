use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, NotSet, QueryFilter, Set,
};
use uuid::Uuid;

use backend::entries::entities::{
    assessment_attempt, assessment_question, assessment_quiz, content_chapter, content_subject,
    content_topic, learning_notes, learning_progress, learning_recall_answer,
    learning_recall_session, permission, role, role_permission, user, user_profile, user_role,
};
use backend::entries::entity_enums::action_types::ActionTypeEnum;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use backend::entries::entity_enums::resource_types::ResourceTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use backend::entries::entity_enums::content_owner_types::ContentOwnerTypeEnum;
use backend::entries::entity_enums::external_reference_type::ExternalReferenceTypeEnum;
use backend::entries::entity_enums::notes_content_type::NotesContentTypeEnum;
use backend::entries::entity_enums::trust_level::TrustLevelEnum;

use crate::fixtures::context::{
    TestChapter, TestNote, TestQuestion, TestRecallSession, TestSubject, TestTopic, TestUser,
};

/// Ensure a role exists in the roles table. Creates it if missing.
/// Returns the role ID.
pub async fn ensure_role_exists(db: &DatabaseConnection, role_type: UserTypeEnums) -> Uuid {
    let existing = role::Entity::find()
        .filter(role::Column::Name.eq(role_type))
        .one(db)
        .await
        .expect("failed to query role");

    if let Some(existing_role) = existing {
        return existing_role.id;
    }

    let id = Uuid::new_v4();
    let display_name = match role_type {
        UserTypeEnums::STUDENT => "Student",
        UserTypeEnums::TEACHER => "Teacher",
        UserTypeEnums::ADMIN => "Administrator",
    };
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = role::ActiveModel {
        id: Set(id),
        name: Set(role_type),
        display_name: Set(display_name.to_string()),
        description: Set(Some(format!("{} role", display_name))),
        is_system_role: Set(true),
        created_at: Set(now),
        updated_at: Set(now),
    };
    model.insert(db).await.expect("failed to insert role");

    id
}

/// Create a test user with profile and role assignment.
pub async fn create_test_user(
    db: &DatabaseConnection,
    email: &str,
    password: &str,
    role_type: UserTypeEnums,
) -> TestUser {
    let id = Uuid::new_v4();
    let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST).expect("hash password");
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let user_model = user::ActiveModel {
        id: Set(id),
        email: Set(email.to_string()),
        password_hash: Set(password_hash),
        is_active: Set(true),
        created_at: Set(now),
        updated_at: Set(now),
    };
    user_model.insert(db).await.expect("insert user");

    let profile_model = user_profile::ActiveModel {
        user_id: Set(id),
        first_name: Set(Some("Test".to_string())),
        last_name: Set(Some("User".to_string())),
        avatar_url: Set(None),
        phone: Set(None),
        timezone: Set(None),
        language: Set(None),
        preferences: Set(None),
        last_login: Set(None),
        login_count: Set(Some(0)),
        account_locked_until: Set(None),
        failed_login_attempts: Set(Some(0)),
        mfa_enabled: Set(None),
        mfa_secret_encrypted: Set(None),
    };
    profile_model.insert(db).await.expect("insert user profile");

    let role_id = ensure_role_exists(db, role_type).await;
    let user_role_model = user_role::ActiveModel {
        id: Set(Uuid::new_v4()),
        user_id: Set(id),
        role_id: Set(role_id),
        assigned_by: Set(None),
        assigned_at: Set(now),
        expires_at: Set(None),
        is_active: Set(true),
    };
    user_role_model.insert(db).await.expect("insert user role");

    TestUser {
        id,
        email: email.to_string(),
    }
}

/// Create a test subject.
pub async fn create_test_subject(
    db: &DatabaseConnection,
    name: &str,
    exam_type: ExamTypeEnums,
) -> TestSubject {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = content_subject::ActiveModel {
        id: Set(id),
        name: Set(name.to_string()),
        exam_type: Set(exam_type.clone()),
        created_at: Set(now),
        updated_at: Set(now),
    };
    model.insert(db).await.expect("insert subject");

    TestSubject { id }
}

/// Create a test chapter.
pub async fn create_test_chapter(
    db: &DatabaseConnection,
    subject_id: Uuid,
    name: &str,
    order: i32,
) -> TestChapter {
    let id = Uuid::new_v4();

    let model = content_chapter::ActiveModel {
        id: Set(id),
        name: Set(name.to_string()),
        subject_id: Set(subject_id),
        order_number: Set(order),
    };
    model.insert(db).await.expect("insert chapter");

    TestChapter { id }
}

/// Create a test topic.
pub async fn create_test_topic(
    db: &DatabaseConnection,
    chapter_id: Uuid,
    name: &str,
    order: i32,
) -> TestTopic {
    let id = Uuid::new_v4();

    let model = content_topic::ActiveModel {
        id: Set(id),
        name: Set(name.to_string()),
        chapter_id: Set(chapter_id),
        order_number: Set(order),
    };
    model.insert(db).await.expect("insert topic");

    TestTopic { id }
}

/// Create a test quiz for a topic, returning the quiz ID.
pub async fn create_test_quiz(db: &DatabaseConnection, topic_id: Uuid, title: &str) -> Uuid {
    let id = Uuid::new_v4();

    let model = assessment_quiz::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        title: Set(title.to_string()),
    };
    model.insert(db).await.expect("insert quiz");

    id
}

/// Create a completed recall session for a user and topic.
pub async fn create_test_completed_recall_session(
    db: &DatabaseConnection,
    user_id: Uuid,
    topic_id: Uuid,
) -> TestRecallSession {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = learning_recall_session::ActiveModel {
        id: Set(id),
        user_id: Set(user_id),
        topic_id: Set(topic_id),
        status: Set(LearningRecallSessionStatusEnum::COMPLETED),
        started_at: Set(now),
        completed_at: Set(Some(now)),
    };
    model
        .insert(db)
        .await
        .expect("insert completed recall session");

    TestRecallSession { id }
}

/// Create a recall answer with configurable question type, correctness, and score.
pub async fn create_test_recall_answer_variant(
    db: &DatabaseConnection,
    session_id: Uuid,
    question_type: LearningRecallQuestionTypeEnum,
    is_correct: bool,
    score: Option<i32>,
) -> Uuid {
    let id = Uuid::new_v4();

    let model = learning_recall_answer::ActiveModel {
        id: Set(id),
        session_id: Set(session_id),
        question_type: Set(question_type),
        question: Set(String::new()),
        answer: Set(String::new()),
        is_correct: Set(is_correct),
        score: Set(score),
    };
    model
        .insert(db)
        .await
        .expect("insert recall answer variant");
    id
}

/// Create a learning progress record for a user and topic.
pub async fn create_test_learning_progress(
    db: &DatabaseConnection,
    user_id: Uuid,
    topic_id: Uuid,
    progress_percent: i32,
) -> Uuid {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = learning_progress::ActiveModel {
        id: Set(id),
        user_id: Set(user_id),
        topic_id: Set(topic_id),
        progress_percent: Set(progress_percent),
        last_accessed_at: Set(now),
    };
    model.insert(db).await.expect("insert learning progress");
    id
}

/// Create a test assessment attempt for a quiz and user, returning the attempt ID.
pub async fn create_test_assessment_attempt(
    db: &DatabaseConnection,
    quiz_id: Uuid,
    user_id: Uuid,
    score: i32,
) -> Uuid {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = assessment_attempt::ActiveModel {
        id: Set(id),
        quiz_id: Set(quiz_id),
        user_id: Set(user_id),
        score: Set(score),
        started_at: Set(now),
        submitted_at: Set(Some(now)),
    };
    model.insert(db).await.expect("insert assessment attempt");
    id
}

/// Ensure the analytics permission exists, creating it if needed.
/// Also links the permission to the ADMIN role so admin users can access insights.
pub async fn ensure_analytics_permission(db: &DatabaseConnection) -> Uuid {
    let permission_name = "analytics:view";
    let existing = permission::Entity::find()
        .filter(permission::Column::Name.eq(permission_name))
        .one(db)
        .await
        .expect("failed to query permission");

    if let Some(p) = existing {
        return p.id;
    }

    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = permission::ActiveModel {
        id: Set(id),
        name: Set(permission_name.to_string()),
        resource_type: Set(ResourceTypeEnum::SYSTEM),
        action: Set(ActionTypeEnum::VIEW_ANALYTICS),
        description: Set(Some("View analytics and insights".to_string())),
        created_at: Set(now),
        updated_at: Set(now),
    };
    model.insert(db).await.expect("insert permission");

    // Link permission to the ADMIN role
    let admin_role_id = ensure_role_exists(db, UserTypeEnums::ADMIN).await;

    let existing_rp = role_permission::Entity::find()
        .filter(role_permission::Column::RoleId.eq(admin_role_id))
        .filter(role_permission::Column::PermissionId.eq(id))
        .one(db)
        .await
        .expect("failed to query role_permission");

    if existing_rp.is_none() {
        let rp_model = role_permission::ActiveModel {
            id: Set(Uuid::new_v4()),
            role_id: Set(admin_role_id),
            permission_id: Set(id),
            created_at: Set(now),
        };
        rp_model.insert(db).await.expect("insert role_permission");
    }

    id
}

/// Create a test teacher note for a topic.
pub async fn create_test_teacher_note(
    db: &DatabaseConnection,
    topic_id: Uuid,
    content: &str,
    status: &str,
) -> TestNote {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let trust_level = match status {
        "published" => TrustLevelEnum::OFFICIAL,
        "pending_review" => TrustLevelEnum::AI,
        _ => TrustLevelEnum::USER,
    };

    let model = learning_notes::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        owner_type: Set(ContentOwnerTypeEnum::TEACHER),
        owner_id: NotSet,
        video_id: NotSet,
        video_timestamp: NotSet,
        content_type: Set(NotesContentTypeEnum::INLINE),
        content: Set(Some(content.to_string())),
        external_url: NotSet,
        external_type: NotSet,
        is_public: Set(true),
        trust_level: Set(trust_level),
        created_at: Set(now),
        updated_at: Set(now),
        deleted_at: NotSet,
    };
    model.insert(db).await.expect("insert teacher note");

    TestNote { id }
}

/// Create a test AI note for a topic.
pub async fn create_test_ai_note(
    db: &DatabaseConnection,
    topic_id: Uuid,
    _title: &str,
    content: &str,
    status: &str,
) -> TestNote {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let trust_level = match status {
        "approved" => TrustLevelEnum::OFFICIAL,
        _ => TrustLevelEnum::AI,
    };

    let model = learning_notes::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        owner_type: Set(ContentOwnerTypeEnum::AI),
        owner_id: NotSet,
        video_id: NotSet,
        video_timestamp: NotSet,
        content_type: Set(NotesContentTypeEnum::INLINE),
        content: Set(Some(format!("<p>{}</p>", content))),
        external_url: NotSet,
        external_type: NotSet,
        is_public: Set(true),
        trust_level: Set(trust_level),
        created_at: Set(now),
        updated_at: Set(now),
        deleted_at: NotSet,
    };
    model.insert(db).await.expect("insert ai note");

    TestNote { id }
}

/// Create a test external reference for a topic.
pub async fn create_test_reference(
    db: &DatabaseConnection,
    topic_id: Uuid,
    title: &str,
    _source: &str,
    ref_type: &str,
    url: &str,
    visible: bool,
) -> TestNote {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let external_type = match ref_type {
        "PDF" => ExternalReferenceTypeEnum::Pdf,
        "Document" => ExternalReferenceTypeEnum::Document,
        "URL" => ExternalReferenceTypeEnum::Url,
        "Video" => ExternalReferenceTypeEnum::Video,
        "Research Paper" => ExternalReferenceTypeEnum::ResearchPaper,
        _ => ExternalReferenceTypeEnum::Url,
    };

    let model = learning_notes::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        owner_type: Set(ContentOwnerTypeEnum::TEACHER),
        owner_id: NotSet,
        video_id: NotSet,
        video_timestamp: NotSet,
        content_type: Set(NotesContentTypeEnum::EXTERNAL),
        content: Set(Some(title.to_string())),
        external_url: Set(Some(url.to_string())),
        external_type: Set(Some(external_type)),
        is_public: Set(visible),
        trust_level: Set(TrustLevelEnum::USER),
        created_at: Set(now),
        updated_at: Set(now),
        deleted_at: NotSet,
    };
    model.insert(db).await.expect("insert reference");

    TestNote { id }
}

/// Create a test question for a quiz.
pub async fn create_test_question(
    db: &DatabaseConnection,
    quiz_id: Uuid,
    question: &str,
    correct_answer: &str,
    options: serde_json::Value,
) -> TestQuestion {
    let model = assessment_question::ActiveModel {
        id: Set(Uuid::new_v4()),
        question: Set(question.to_string()),
        correct_answer: Set(correct_answer.to_string()),
        options: Set(options),
        quiz_id: Set(quiz_id),
    };
    model.insert(db).await.expect("insert question");

    TestQuestion
}
