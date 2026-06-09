use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TriggeredRule {
    LowRecallAccuracy,
    StagnantProgress,
    LowEngagement,
    SessionReminder,
    CompletionMilestone,
}

#[derive(Debug, Clone)]
pub struct RecallRuleConfig {
    pub low_threshold: f64,
    pub critical_threshold: f64,
}

impl Default for RecallRuleConfig {
    fn default() -> Self {
        Self {
            low_threshold: 60.0,
            critical_threshold: 40.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ProgressRuleConfig {
    pub stagnant_threshold_days: i64,
    pub min_expected_progress: f64,
}

impl Default for ProgressRuleConfig {
    fn default() -> Self {
        Self {
            stagnant_threshold_days: 7,
            min_expected_progress: 10.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct EngagementRuleConfig {
    pub low_days_threshold: i64,
    pub critical_days_threshold: i64,
}

impl Default for EngagementRuleConfig {
    fn default() -> Self {
        Self {
            low_days_threshold: 7,
            critical_days_threshold: 14,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CompletionRuleConfig {
    pub milestone_thresholds: Vec<f64>,
}

impl Default for CompletionRuleConfig {
    fn default() -> Self {
        Self {
            milestone_thresholds: vec![25.0, 50.0, 75.0, 100.0],
        }
    }
}

pub fn evaluate_recall_rule(
    current_accuracy: f64,
    previous_accuracy: Option<f64>,
    config: &RecallRuleConfig,
) -> Option<TriggeredRule> {
    if current_accuracy < config.critical_threshold {
        return Some(TriggeredRule::LowRecallAccuracy);
    }

    if let Some(prev) = previous_accuracy {
        let drop = prev - current_accuracy;
        if drop > 15.0 && current_accuracy < config.low_threshold {
            return Some(TriggeredRule::LowRecallAccuracy);
        }
    }

    None
}

pub fn evaluate_progress_rule(
    current_progress: f64,
    last_progress: f64,
    last_activity: DateTime<Utc>,
    config: &ProgressRuleConfig,
) -> Option<TriggeredRule> {
    let days_since_activity = (Utc::now() - last_activity).num_days();

    if days_since_activity >= config.stagnant_threshold_days {
        return Some(TriggeredRule::StagnantProgress);
    }

    let progress_delta = current_progress - last_progress;
    if progress_delta < config.min_expected_progress && days_since_activity >= 3 {
        return Some(TriggeredRule::StagnantProgress);
    }

    None
}

pub fn evaluate_engagement_rule(
    days_since_last_access: i64,
    config: &EngagementRuleConfig,
) -> Option<TriggeredRule> {
    if days_since_last_access >= config.low_days_threshold {
        Some(TriggeredRule::LowEngagement)
    } else {
        None
    }
}

pub fn evaluate_completion_rule(
    current_progress: f64,
    previous_milestone: f64,
    config: &CompletionRuleConfig,
) -> Option<TriggeredRule> {
    for &threshold in &config.milestone_thresholds {
        if current_progress >= threshold && previous_milestone < threshold {
            return Some(TriggeredRule::CompletionMilestone);
        }
    }
    None
}

pub fn evaluate_session_reminder_rule(
    last_recall_date: Option<DateTime<Utc>>,
    review_interval_days: i64,
) -> Option<TriggeredRule> {
    match last_recall_date {
        Some(date) => {
            let days_since = (Utc::now() - date).num_days();
            if days_since >= review_interval_days {
                Some(TriggeredRule::SessionReminder)
            } else {
                None
            }
        }
        None => Some(TriggeredRule::SessionReminder),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    #[test]
    fn test_recall_rule_below_critical() {
        let config = RecallRuleConfig::default();
        let result = evaluate_recall_rule(35.0, None, &config);
        assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
    }

    #[test]
    fn test_recall_rule_above_threshold() {
        let config = RecallRuleConfig::default();
        let result = evaluate_recall_rule(75.0, None, &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_recall_rule_significant_drop() {
        let config = RecallRuleConfig::default();
        let result = evaluate_recall_rule(50.0, Some(75.0), &config);
        assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
    }

    #[test]
    fn test_recall_rule_small_drop_no_trigger() {
        let config = RecallRuleConfig::default();
        let result = evaluate_recall_rule(70.0, Some(75.0), &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_progress_rule_stagnant_days_exceeded() {
        let config = ProgressRuleConfig::default();
        let long_ago = Utc::now() - Duration::days(10);
        let result = evaluate_progress_rule(50.0, 45.0, long_ago, &config);
        assert_eq!(result, Some(TriggeredRule::StagnantProgress));
    }

    #[test]
    fn test_progress_rule_active() {
        let config = ProgressRuleConfig::default();
        let recent = Utc::now();
        let result = evaluate_progress_rule(50.0, 45.0, recent, &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_progress_rule_slow_progress_triggers() {
        let config = ProgressRuleConfig::default();
        let five_days_ago = Utc::now() - Duration::days(5);
        let result = evaluate_progress_rule(12.0, 10.0, five_days_ago, &config);
        assert_eq!(result, Some(TriggeredRule::StagnantProgress));
    }

    #[test]
    fn test_engagement_rule_no_access_14_days() {
        let config = EngagementRuleConfig::default();
        let result = evaluate_engagement_rule(14, &config);
        assert_eq!(result, Some(TriggeredRule::LowEngagement));
    }

    #[test]
    fn test_engagement_rule_active_user() {
        let config = EngagementRuleConfig::default();
        let result = evaluate_engagement_rule(1, &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_completion_rule_hits_milestone() {
        let config = CompletionRuleConfig::default();
        let result = evaluate_completion_rule(50.0, 20.0, &config);
        assert_eq!(result, Some(TriggeredRule::CompletionMilestone));
    }

    #[test]
    fn test_completion_rule_no_new_milestone() {
        let config = CompletionRuleConfig::default();
        let result = evaluate_completion_rule(45.0, 44.0, &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_completion_rule_multiple_milestones_returns_first() {
        let config = CompletionRuleConfig::default();
        let result = evaluate_completion_rule(85.0, 20.0, &config).unwrap();
        assert_eq!(result, TriggeredRule::CompletionMilestone);
    }

    #[test]
    fn test_session_reminder_no_records() {
        let result = evaluate_session_reminder_rule(None, 1);
        assert_eq!(result, Some(TriggeredRule::SessionReminder));
    }

    #[test]
    fn test_session_reminder_not_due_yet() {
        let recent = Utc::now();
        let result = evaluate_session_reminder_rule(Some(recent), 7);
        assert_eq!(result, None);
    }

    #[test]
    fn test_session_reminder_overdue() {
        let long_ago = Utc::now() - Duration::days(10);
        let result = evaluate_session_reminder_rule(Some(long_ago), 7);
        assert_eq!(result, Some(TriggeredRule::SessionReminder));
    }

    #[test]
    fn test_recall_rule_critical_first() {
        let config = RecallRuleConfig::default();
        let result = evaluate_recall_rule(20.0, Some(35.0), &config);
        assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
    }

    #[test]
    fn test_progress_rule_zero_delta_over_threshold() {
        let config = ProgressRuleConfig::default();
        let recent = Utc::now();
        let result = evaluate_progress_rule(50.0, 50.0, recent, &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_engagement_rule_boundary() {
        let config = EngagementRuleConfig::default();
        assert_eq!(evaluate_engagement_rule(6, &config), None);
        assert_eq!(
            evaluate_engagement_rule(7, &config),
            Some(TriggeredRule::LowEngagement)
        );
        assert_eq!(
            evaluate_engagement_rule(13, &config),
            Some(TriggeredRule::LowEngagement)
        );
        assert_eq!(
            evaluate_engagement_rule(14, &config),
            Some(TriggeredRule::LowEngagement)
        );
    }
}
