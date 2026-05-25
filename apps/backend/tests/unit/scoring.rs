use backend::entries::entities::learning_recall_answer::Model as RecallAnswerModel;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::infra::db::repositories::insights_repo::{
    calculate_combined_accuracy, calculate_mcq_strength, calculate_reflection_strength,
};
use uuid::Uuid;

fn make_answer(
    question_type: LearningRecallQuestionTypeEnum,
    is_correct: bool,
    score: Option<i32>,
) -> RecallAnswerModel {
    RecallAnswerModel {
        id: Uuid::new_v4(),
        session_id: Uuid::new_v4(),
        question_type,
        question: "What is 2+2?".to_string(),
        answer: "4".to_string(),
        is_correct,
        score,
    }
}

#[test]
fn mcq_strength_empty_returns_none() {
    assert_eq!(calculate_mcq_strength(&[]), None);
}

#[test]
fn mcq_strength_all_correct() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
    ];
    assert_eq!(calculate_mcq_strength(&answers), Some(100.0));
}

#[test]
fn mcq_strength_half_correct() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::MCQ, false, None),
    ];
    assert_eq!(calculate_mcq_strength(&answers), Some(50.0));
}

#[test]
fn mcq_strength_all_wrong() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, false, None),
        make_answer(LearningRecallQuestionTypeEnum::MCQ, false, None),
    ];
    assert_eq!(calculate_mcq_strength(&answers), Some(0.0));
}

#[test]
fn mcq_strength_ignores_reflection() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(80)),
    ];
    assert_eq!(calculate_mcq_strength(&answers), Some(100.0));
}

#[test]
fn reflection_strength_empty_returns_none() {
    assert_eq!(calculate_reflection_strength(&[]), None);
}

#[test]
fn reflection_strength_all_max_scores() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(100)),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(100)),
    ];
    assert_eq!(calculate_reflection_strength(&answers), Some(100.0));
}

#[test]
fn reflection_strength_partial_scores() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(80)),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(20)),
    ];
    assert_eq!(calculate_reflection_strength(&answers), Some(50.0));
}

#[test]
fn reflection_strength_zero_scores() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(0)),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(0)),
    ];
    assert_eq!(calculate_reflection_strength(&answers), Some(0.0));
}

#[test]
fn reflection_strength_ignores_mcq() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(50)),
    ];
    assert_eq!(calculate_reflection_strength(&answers), Some(50.0));
}

#[test]
fn combined_accuracy_empty_returns_zero() {
    assert_eq!(calculate_combined_accuracy(&[]), 0.0);
}

#[test]
fn combined_accuracy_all_correct() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(100)),
    ];
    assert_eq!(calculate_combined_accuracy(&answers), 100.0);
}

#[test]
fn combined_accuracy_mixed_results() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None),
        make_answer(LearningRecallQuestionTypeEnum::MCQ, false, None),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(80)),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(20)),
    ];
    let result = calculate_combined_accuracy(&answers);
    assert!((result - 50.0).abs() < f64::EPSILON);
}

#[test]
fn combined_accuracy_all_failing_reflection() {
    let answers = vec![
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(30)),
        make_answer(LearningRecallQuestionTypeEnum::REFLECTION, true, Some(40)),
    ];
    assert_eq!(calculate_combined_accuracy(&answers), 0.0);
}
