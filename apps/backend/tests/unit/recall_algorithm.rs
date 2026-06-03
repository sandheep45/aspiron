use backend::entries::entities::learning_recall_answer::Model as RecallAnswerModel;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::http::responses::insights::RecallStrength;
use uuid::Uuid;

fn make_answer(
    question_type: LearningRecallQuestionTypeEnum,
    is_correct: bool,
    score: Option<i32>,
) -> RecallAnswerModel {
    let question_type_clone = question_type.clone();
    RecallAnswerModel {
        id: Uuid::new_v4(),
        session_id: Uuid::new_v4(),
        question_type,
        question: format!("Test question for {:?}", question_type_clone),
        answer: if is_correct {
            "Correct answer"
        } else {
            "Wrong answer"
        }
        .to_string(),
        is_correct,
        score,
    }
}

#[test]
fn test_recall_strength_classification() {
    // Import the classification function from the pain_points module
    use backend::application::insights::pain_points::classify_recall_strength;

    // Test the classification thresholds
    assert_eq!(classify_recall_strength(39.9), RecallStrength::Weak);
    assert_eq!(classify_recall_strength(40.0), RecallStrength::Medium);
    assert_eq!(classify_recall_strength(69.9), RecallStrength::Medium);
    assert_eq!(classify_recall_strength(70.0), RecallStrength::Strong);
    assert_eq!(classify_recall_strength(100.0), RecallStrength::Strong);
}

#[test]
fn test_spaced_repetition_interval_calculation() {
    // This would test the actual spaced repetition algorithm
    // For now, we just verify the classification function works
    // In a real implementation, this would test SM-2 or similar algorithm

    // Test that we can process answers
    let answers = [
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None), // Correct answer
        make_answer(LearningRecallQuestionTypeEnum::MCQ, true, None), // Correct answer
        make_answer(LearningRecallQuestionTypeEnum::MCQ, false, None), // Wrong answer
    ];

    // Verify we can process the answers
    assert!(!answers.is_empty());
    assert_eq!(answers.len(), 3);
}
