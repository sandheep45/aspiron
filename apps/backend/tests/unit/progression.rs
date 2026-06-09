use backend::domain::content::progression::{
    CompletionCriteria, TopicCompletionData, TopicNode, TopicStatus, chain_is_complete,
    determine_topic_status, evaluate_batch,
};
use uuid::Uuid;

fn make_topic_performance(
    id: u128,
    accuracy: f64,
    recall: f64,
    attempts: u32,
    prereqs: Vec<u128>,
) -> TopicNode {
    TopicNode {
        topic_id: Uuid::from_u128(id),
        prerequisite_ids: prereqs.into_iter().map(Uuid::from_u128).collect(),
        completion_data: TopicCompletionData {
            topic_id: Uuid::from_u128(id),
            practice_accuracy: accuracy,
            recall_strength_mcq: Some(recall),
            recall_strength_reflection: None,
            quiz_attempts: attempts,
            has_completed_recall_session: true,
        },
    }
}

#[test]
fn test_topic_completed_all_criteria_met() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 85.0,
        recall_strength_mcq: Some(70.0),
        recall_strength_reflection: None,
        quiz_attempts: 3,
        has_completed_recall_session: true,
    };
    assert!(data.is_completed(&CompletionCriteria::default()));
}

#[test]
fn test_topic_not_completed_low_accuracy() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 45.0,
        recall_strength_mcq: Some(70.0),
        recall_strength_reflection: None,
        quiz_attempts: 3,
        has_completed_recall_session: true,
    };
    assert!(!data.is_completed(&CompletionCriteria::default()));
}

#[test]
fn test_topic_not_completed_low_recall() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 85.0,
        recall_strength_mcq: Some(30.0),
        recall_strength_reflection: None,
        quiz_attempts: 3,
        has_completed_recall_session: true,
    };
    assert!(!data.is_completed(&CompletionCriteria::default()));
}

#[test]
fn test_topic_not_completed_no_quiz_attempts() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 85.0,
        recall_strength_mcq: Some(70.0),
        recall_strength_reflection: None,
        quiz_attempts: 0,
        has_completed_recall_session: true,
    };
    assert!(!data.is_completed(&CompletionCriteria::default()));
}

#[test]
fn test_topic_not_completed_missing_recall_session() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 85.0,
        recall_strength_mcq: Some(70.0),
        recall_strength_reflection: None,
        quiz_attempts: 3,
        has_completed_recall_session: false,
    };
    assert!(!data.is_completed(&CompletionCriteria::default()));
}

#[test]
fn test_topic_no_prerequisites_completed() {
    let node = make_topic_performance(1, 85.0, 70.0, 3, vec![]);
    let status = determine_topic_status(&node, &[], &CompletionCriteria::default());
    assert_eq!(status, TopicStatus::Completed);
}

#[test]
fn test_topic_locked_when_prerequisite_not_met() {
    let node = make_topic_performance(2, 85.0, 70.0, 3, vec![1]);
    let prereqs = vec![(Uuid::from_u128(1), TopicStatus::Available)];
    let status = determine_topic_status(&node, &prereqs, &CompletionCriteria::default());
    assert_eq!(status, TopicStatus::Locked);
}

#[test]
fn test_topic_unlocked_when_prerequisite_completed() {
    let node = make_topic_performance(2, 85.0, 70.0, 3, vec![1]);
    let prereqs = vec![(Uuid::from_u128(1), TopicStatus::Completed)];
    let status = determine_topic_status(&node, &prereqs, &CompletionCriteria::default());
    assert_eq!(status, TopicStatus::Completed);
}

#[test]
fn test_topic_available_but_incomplete() {
    let node = make_topic_performance(1, 30.0, 20.0, 0, vec![]);
    let status = determine_topic_status(&node, &[], &CompletionCriteria::default());
    assert_eq!(status, TopicStatus::Available);
}

#[test]
fn test_sequential_chain_all_complete() {
    let nodes = vec![
        make_topic_performance(1, 85.0, 70.0, 3, vec![]),
        make_topic_performance(2, 85.0, 70.0, 3, vec![1]),
        make_topic_performance(3, 85.0, 70.0, 3, vec![2]),
    ];
    let results = evaluate_batch(&nodes, &CompletionCriteria::default());
    assert_eq!(results.len(), 3);
    for (_, status) in &results {
        assert_eq!(*status, TopicStatus::Completed);
    }
}

#[test]
fn test_chain_blocked_by_first_incomplete() {
    let nodes = vec![
        make_topic_performance(1, 30.0, 20.0, 0, vec![]),
        make_topic_performance(2, 85.0, 70.0, 3, vec![1]),
        make_topic_performance(3, 85.0, 70.0, 3, vec![2]),
    ];
    let results = evaluate_batch(&nodes, &CompletionCriteria::default());
    assert_eq!(results[0].1, TopicStatus::Available);
    assert_eq!(results[1].1, TopicStatus::Locked);
    assert_eq!(results[2].1, TopicStatus::Locked);
}

#[test]
fn test_completion_criteria_default_values() {
    let criteria = CompletionCriteria::default();
    assert_eq!(criteria.min_practice_accuracy, 60.0);
    assert_eq!(criteria.min_recall_strength, 40.0);
    assert_eq!(criteria.min_quiz_attempts, 1);
    assert!(criteria.require_recall_session);
}

#[test]
fn test_chain_is_complete_true() {
    let nodes = vec![
        make_topic_performance(1, 85.0, 70.0, 3, vec![]),
        make_topic_performance(2, 90.0, 80.0, 3, vec![]),
    ];
    assert!(chain_is_complete(&nodes, &CompletionCriteria::default()));
}

#[test]
fn test_chain_is_complete_false() {
    let nodes = vec![
        make_topic_performance(1, 85.0, 70.0, 3, vec![]),
        make_topic_performance(2, 30.0, 20.0, 0, vec![]),
    ];
    assert!(!chain_is_complete(&nodes, &CompletionCriteria::default()));
}

#[test]
fn test_topic_completion_logic() {
    let topic1 = make_topic_performance(1, 85.0, 70.0, 3, vec![]);
    let topic2 = make_topic_performance(2, 45.0, 30.0, 1, vec![]);

    let results = evaluate_batch(&[topic1, topic2], &CompletionCriteria::default());
    assert_eq!(results[0].1, TopicStatus::Completed);
    assert_eq!(results[1].1, TopicStatus::Available);
}

#[test]
fn test_overall_progress_weighted_calculation() {
    let data = TopicCompletionData {
        topic_id: Uuid::new_v4(),
        practice_accuracy: 50.0,
        recall_strength_mcq: Some(50.0),
        recall_strength_reflection: None,
        quiz_attempts: 1,
        has_completed_recall_session: false,
    };
    let progress = data.overall_progress();
    assert!((progress - 60.0).abs() < 0.01);
}
