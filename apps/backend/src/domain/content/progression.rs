use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TopicStatus {
    Locked,
    Available,
    Completed,
}

#[derive(Debug, Clone)]
pub struct CompletionCriteria {
    pub min_practice_accuracy: f64,
    pub min_recall_strength: f64,
    pub min_quiz_attempts: u32,
    pub require_recall_session: bool,
}

impl Default for CompletionCriteria {
    fn default() -> Self {
        Self {
            min_practice_accuracy: 60.0,
            min_recall_strength: 40.0,
            min_quiz_attempts: 1,
            require_recall_session: true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct TopicCompletionData {
    pub topic_id: Uuid,
    pub practice_accuracy: f64,
    pub recall_strength_mcq: Option<f64>,
    pub recall_strength_reflection: Option<f64>,
    pub quiz_attempts: u32,
    pub has_completed_recall_session: bool,
}

impl TopicCompletionData {
    pub fn is_completed(&self, criteria: &CompletionCriteria) -> bool {
        self.practice_accuracy >= criteria.min_practice_accuracy
            && self
                .recall_strength()
                .is_some_and(|rs| rs >= criteria.min_recall_strength)
            && self.quiz_attempts >= criteria.min_quiz_attempts
            && (!criteria.require_recall_session || self.has_completed_recall_session)
    }

    pub fn recall_strength(&self) -> Option<f64> {
        self.recall_strength_mcq.or(self.recall_strength_reflection)
    }

    pub fn overall_progress(&self) -> f64 {
        let accuracy_weight = self.practice_accuracy.clamp(0.0, 100.0) * 0.4;
        let recall_weight = self.recall_strength().unwrap_or(0.0) * 0.4;
        let attempt_weight = if self.quiz_attempts >= 1 {
            100.0 * 0.2
        } else {
            0.0
        };
        (accuracy_weight + recall_weight + attempt_weight).clamp(0.0, 100.0)
    }
}

#[derive(Debug, Clone)]
pub struct TopicNode {
    pub topic_id: Uuid,
    pub prerequisite_ids: Vec<Uuid>,
    pub completion_data: TopicCompletionData,
}

pub fn determine_topic_status(
    topic: &TopicNode,
    prerequisite_statuses: &[(Uuid, TopicStatus)],
    criteria: &CompletionCriteria,
) -> TopicStatus {
    let prereq_map: std::collections::HashMap<Uuid, TopicStatus> =
        prerequisite_statuses.iter().cloned().collect();

    for prereq_id in &topic.prerequisite_ids {
        match prereq_map.get(prereq_id) {
            Some(TopicStatus::Completed) => continue,
            _ => return TopicStatus::Locked,
        }
    }

    if topic.completion_data.is_completed(criteria) {
        TopicStatus::Completed
    } else {
        TopicStatus::Available
    }
}

pub fn evaluate_batch(
    nodes: &[TopicNode],
    criteria: &CompletionCriteria,
) -> Vec<(Uuid, TopicStatus)> {
    let mut statuses: std::collections::HashMap<Uuid, TopicStatus> =
        std::collections::HashMap::new();
    let mut result = Vec::with_capacity(nodes.len());

    for node in nodes {
        let prereq_list: Vec<(Uuid, TopicStatus)> = node
            .prerequisite_ids
            .iter()
            .map(|id| (*id, *statuses.get(id).unwrap_or(&TopicStatus::Locked)))
            .collect();

        let status = determine_topic_status(node, &prereq_list, criteria);
        statuses.insert(node.topic_id, status);
        result.push((node.topic_id, status));
    }

    result
}

pub fn chain_is_complete(nodes: &[TopicNode], criteria: &CompletionCriteria) -> bool {
    nodes.iter().all(|n| {
        let prereq_list = vec![];
        let status = determine_topic_status(n, &prereq_list, criteria);
        status == TopicStatus::Completed
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_node(id: u32, accuracy: f64, recall: f64, prereqs: Vec<u32>) -> TopicNode {
        TopicNode {
            topic_id: Uuid::from_u128(id as u128),
            prerequisite_ids: prereqs
                .into_iter()
                .map(|p| Uuid::from_u128(p as u128))
                .collect(),
            completion_data: TopicCompletionData {
                topic_id: Uuid::from_u128(id as u128),
                practice_accuracy: accuracy,
                recall_strength_mcq: Some(recall),
                recall_strength_reflection: None,
                quiz_attempts: 2,
                has_completed_recall_session: true,
            },
        }
    }

    #[test]
    fn test_topic_meets_criteria() {
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
    fn test_topic_below_accuracy_threshold() {
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
    fn test_topic_no_recall_session_not_required() {
        let criteria = CompletionCriteria {
            require_recall_session: false,
            ..Default::default()
        };
        let data = TopicCompletionData {
            topic_id: Uuid::new_v4(),
            practice_accuracy: 85.0,
            recall_strength_mcq: Some(70.0),
            recall_strength_reflection: None,
            quiz_attempts: 3,
            has_completed_recall_session: false,
        };
        assert!(data.is_completed(&criteria));
    }

    #[test]
    fn test_topic_no_recall_session_required() {
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
    fn test_topic_insufficient_quiz_attempts() {
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
    fn test_recall_strength_falls_back_to_reflection() {
        let data = TopicCompletionData {
            topic_id: Uuid::new_v4(),
            practice_accuracy: 0.0,
            recall_strength_mcq: None,
            recall_strength_reflection: Some(65.0),
            quiz_attempts: 0,
            has_completed_recall_session: false,
        };
        assert_eq!(data.recall_strength(), Some(65.0));
    }

    #[test]
    fn test_topic_available_no_prerequisites() {
        let node = make_node(1, 85.0, 70.0, vec![]);
        let status = determine_topic_status(&node, &[], &CompletionCriteria::default());
        assert_eq!(status, TopicStatus::Completed);
    }

    #[test]
    fn test_topic_locked_prerequisite_not_completed() {
        let node = make_node(2, 85.0, 70.0, vec![1]);
        let prereq_statuses = vec![(Uuid::from_u128(1), TopicStatus::Available)];
        let status =
            determine_topic_status(&node, &prereq_statuses, &CompletionCriteria::default());
        assert_eq!(status, TopicStatus::Locked);
    }

    #[test]
    fn test_topic_unlocked_prerequisite_completed() {
        let node = make_node(2, 85.0, 70.0, vec![1]);
        let prereq_statuses = vec![(Uuid::from_u128(1), TopicStatus::Completed)];
        let status =
            determine_topic_status(&node, &prereq_statuses, &CompletionCriteria::default());
        assert_eq!(status, TopicStatus::Completed);
    }

    #[test]
    fn test_topic_available_but_not_completed() {
        let node = make_node(1, 30.0, 20.0, vec![]);
        let status = determine_topic_status(&node, &[], &CompletionCriteria::default());
        assert_eq!(status, TopicStatus::Available);
    }

    #[test]
    fn test_evaluate_batch_sequential() {
        let nodes = vec![
            make_node(1, 85.0, 70.0, vec![]),
            make_node(2, 85.0, 70.0, vec![1]),
            make_node(3, 85.0, 70.0, vec![2]),
        ];
        let results = evaluate_batch(&nodes, &CompletionCriteria::default());
        assert_eq!(results.len(), 3);
        assert_eq!(results[0].1, TopicStatus::Completed);
        assert_eq!(results[1].1, TopicStatus::Completed);
        assert_eq!(results[2].1, TopicStatus::Completed);
    }

    #[test]
    fn test_evaluate_batch_first_locked() {
        let nodes = vec![
            make_node(1, 30.0, 20.0, vec![]),
            make_node(2, 85.0, 70.0, vec![1]),
            make_node(3, 85.0, 70.0, vec![2]),
        ];
        let results = evaluate_batch(&nodes, &CompletionCriteria::default());
        assert_eq!(results[0].1, TopicStatus::Available);
        assert_eq!(results[1].1, TopicStatus::Locked);
        assert_eq!(results[2].1, TopicStatus::Locked);
    }

    #[test]
    fn test_overall_progress_mid() {
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

    #[test]
    fn test_overall_progress_no_quiz_attempts() {
        let data = TopicCompletionData {
            topic_id: Uuid::new_v4(),
            practice_accuracy: 100.0,
            recall_strength_mcq: Some(100.0),
            recall_strength_reflection: None,
            quiz_attempts: 0,
            has_completed_recall_session: false,
        };
        let progress = data.overall_progress();
        assert!((progress - 80.0).abs() < 0.01);
    }

    #[test]
    fn test_completion_criteria_defaults() {
        let c = CompletionCriteria::default();
        assert_eq!(c.min_practice_accuracy, 60.0);
        assert_eq!(c.min_recall_strength, 40.0);
        assert_eq!(c.min_quiz_attempts, 1);
        assert!(c.require_recall_session);
    }

    #[test]
    fn test_chain_is_complete_all_completed() {
        let nodes = vec![
            make_node(1, 85.0, 70.0, vec![]),
            make_node(2, 90.0, 80.0, vec![]),
        ];
        assert!(chain_is_complete(&nodes, &CompletionCriteria::default()));
    }

    #[test]
    fn test_chain_is_complete_one_not_completed() {
        let nodes = vec![
            make_node(1, 85.0, 70.0, vec![]),
            make_node(2, 30.0, 20.0, vec![]),
        ];
        assert!(!chain_is_complete(&nodes, &CompletionCriteria::default()));
    }
}
