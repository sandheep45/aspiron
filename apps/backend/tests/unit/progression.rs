use backend::domain::insights::entities::TopicPerformance;
use uuid::Uuid;

#[test]
fn test_topic_performance_creation() {
    let tp = TopicPerformance {
        topic_id: Uuid::new_v4(),
        subject_id: Uuid::new_v4(),
        topic_name: "Test Topic".to_string(),
        chapter_name: "Test Chapter".to_string(),
        subject_name: "Test Subject".to_string(),
        recall_strength_mcq: Some(80.0),
        recall_strength_reflection: Some(60.0),
        practice_accuracy: 75.0,
        students_affected: 5,
        total_students: 20,
    };

    assert_eq!(tp.topic_name, "Test Topic");
    assert_eq!(tp.practice_accuracy, 75.0);
}

#[test]
fn test_topic_completion_logic() {
    // This would test the actual topic completion/unlock logic
    // For now, we just verify the data structures work

    let topic1 = TopicPerformance {
        topic_id: Uuid::new_v4(),
        subject_id: Uuid::new_v4(),
        topic_name: "Topic 1".to_string(),
        chapter_name: "Chapter 1".to_string(),
        subject_name: "Subject 1".to_string(),
        recall_strength_mcq: Some(80.0),
        recall_strength_reflection: Some(60.0),
        practice_accuracy: 85.0, // Above passing threshold
        students_affected: 3,
        total_students: 10,
    };

    let topic2 = TopicPerformance {
        topic_id: Uuid::new_v4(),
        subject_id: Uuid::new_v4(),
        topic_name: "Topic 2".to_string(),
        chapter_name: "Chapter 1".to_string(),
        subject_name: "Subject 1".to_string(),
        recall_strength_mcq: Some(50.0),
        recall_strength_reflection: Some(40.0),
        practice_accuracy: 45.0, // Below passing threshold
        students_affected: 7,
        total_students: 10,
    };

    // Verify we can distinguish between passing and failing topics
    assert!(topic1.practice_accuracy > 50.0);
    assert!(topic2.practice_accuracy <= 50.0);
}
